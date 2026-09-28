# 🏗️ ARQUITETURA DE REFERÊNCIA — APP ALARCON + BROKER EVOLUTION (NOVO FORMATO)

> Documento canônico do novo fluxo WhatsApp via **Evolution API** (substituindo o broker Baileys, hoje parado).
> Escrito em 2026-09-28 a partir do código vivo (`/opt/data/_evolution_bridge.js`, `sdr-agent-worker/`, `_deploy_all.py`).
> Este doc é o **detalhe**; o índice geral é `.agents/docs/KNOWLEDGE_BASE_GLOBAL.md` (§7).

---

## (a) Arquitetura macro

```
┌────────────────────────┐   HTTPS   ┌─────────────────────────────┐
│ FRONTEND React/Vite    │◄──────────►│ SUPABASE PROD "ptoch"       │
│ repo: alarcon_repo     │           │ ptochsyoyatsydfysacc        │
│ (branch remodel, src/) │           │ (Postgres + PostgREST +     │
│ deploy: Hostinger      │           │  Auth/GoTrue + Storage +    │
│ testealarcon/          │           │  Realtime)                  │
└────────────────────────┘           └──────────────▲──────────────┘
                                                    │ PostgREST (REST)
                                     ┌──────────────┴───────────────┐
                                     │ evolution-bridge (Node, PM2) │
                                     │ VPS 2.24.95.98 :3099         │
                                     │ /root/evolution-bridge/      │
                                     └──────────────▲───────────────┘
                                                    │ webhook POST + REST apikey
                                     ┌──────────────┴───────────────┐
                                     │ EVOLUTION API v2.3.7 (Docker)│
                                     │ VPS localhost:8080           │
                                     │ instância: wpp-alarcon       │
                                     └──────────────────────────────┘
```

- **Frontend:** repo `/opt/data/alarcon_repo` (branch `remodel`), fonte ativa `src/`, build Vite (`dist/`), deploy SFTP para Hostinger `domains/apexfyhub.com.br/public_html/testealarcon/` (homologação com dados reais do PROD). Autentica contra o Supabase PROD `ptoch` (nunca DEV — decisão 25/09).
- **Supabase ptoch** — tabelas chave:
  - **Sessão/conexão:** `whatsapp_sessions` (linhas `default` = exibida no app, `evolution-bridge` = interna do provider Evolution, `provider: 'evolution'`)
  - **Camada WhatsApp:** `whatsapp_contacts` (`remote_jid`, `remote_jid_alt`, `phone_number`, `profile_id`, `conversation_id`), `whatsapp_messages` (inbox + outbox: `status pending/sent/failed`, `from_me`, `whatsapp_message_id`, mídia), `conversations`
  - **Camada CRM:** `profiles` (client_id da conversa; criado sintético `lead.<phone>@leads.alarcon.local`), `messages` (chat CRM), `leads` (+ `lead_timeline`), `routing_assignments`
  - **SDR:** `sdr_steps`, `sdr_sessions`, `sdr_answers` (+ RPC `fn_sdr_should_reply`, toggle `conversations.sdr_enabled`)
  - Tenancy: todas as linhas carregam `tenant_id` (tenant Alarcon `a2c0a41e-8ae4-4c21-8b12-e0b319700908`).

---

## (b) NOVO FLUXO BROKER EVOLUTION (vigente)

Componentes: **Evolution API v2.3.7** (Docker no VPS, `localhost:8080`, header `apikey`, instância **wpp-alarcon**) → **webhook** → **evolution-bridge** (Node puro, PM2 `evolution-bridge`, porta **:3099**, `/root/evolution-bridge/bridge.js`) → **PostgREST** (REST v1 do Supabase com `service_role`) → CRM.

### b.1 Watcher QR/pairing (loop de 4s no bridge)
- Poll em `whatsapp_sessions` onde `session_name='default'` AND `status='connecting'`.
- Se encontrou: `GET /instance/connect/wpp-alarcon` (`?number=<phone>` → pairing code; sem número → QR).
- Grava na sessão default: `status='qr_ready'` + `pairing_code` ou `qr_code` (data URI) + `qr_expires_at` (+60s).
- O app (`WhatsAppConnect.tsx` / `use-whatsapp.ts`) pede sessão via `start_whatsapp_session` (RPC) → cria linha `default` em `connecting` → watcher entrega QR/pairing.

### b.2 `connection.update` (⚠️ chega em **lowercase** do Baileys interno)
- Webhook event `connection.update` (o bridge também normaliza `CONNECTION_UPDATE`).
- `payload.data.state`: `open` → `connected` · `connecting` → `connecting` · demais → `disconnected`.
- **`updateSessionStatus(status)` atualiza AMBAS as sessões**:
  - a `evolution-bridge` (sempre, por id);
  - a `default` do tenant **quando `connected`** — e limpa `qr_code`/`pairing_code`/`qr_expires_at` + grava `phone_number`.
  - *Motivação histórica:* antes só a bridge mudava → o app ficava preso em `qr_ready` mesmo com o WhatsApp pareado.
- Watcher de desconexão (5s): se a sessão bridge virar `disconnected` no banco → `DELETE /instance/logout/wpp-alarcon` na Evolution.

### b.3 Inbound — `MESSAGES_UPSERT` (payload v2.3.7: **`data` DIRETO, não `data.messages[]`**)
- O bridge aceita os dois formatos (normaliza `messages.upsert`→`MESSAGES_UPSERT`, `send.message`→`SEND_MESSAGE`), mas no **v2.3.7 a mensagem vem em `payload.data` direto** (`data.key` + `data.message`) — o array `data.messages[]` é formato legado.
- `data.type` deve ser `notify` (outro tipo é ignorado).
- `processMessage`:
  1. Filtros: descarta `status@broadcast`/`@newsletter`; aceita `@s.whatsapp.net`, `@lid`, `@g.us`; ignora eco do próprio número; ignora mensagens >24h.
  2. **Dedup**: em memória (`Set` por `key.id`) + query `whatsapp_messages` por `whatsapp_session_id+whatsapp_message_id`.
  3. **Mídia** (não-texto, inbound): `POST /message/getBase64FromMediaMessage` (body `{message: evoMsg.message, convertAudio:true}`) → upload no Storage bucket `chat-attachments` (caminho `{session_id}/evo_<ts>.<ext>`, áudio = `.ogg` opus) → `media_status='downloaded'`.
  4. **`findOrCreateConversation(remoteJid, pushName, fromMe)`**:
     - contato por `remote_jid` → se LID, por `remote_jid_alt` → por `phone_number`;
     - profile: por `profiles.phone` → senão cria **user GoTrue sintético** `lead.<phone>@leads.alarcon.local` + `profiles` (role `client`);
     - conversa: `contact.conversation_id` → senão `conversations` aberta do mesmo `client_id` → senão cria (`status 'pending'`, `stage 'Contato Cadastrado'`, `sdr_enabled: true`).
  5. **Lead** (`ensureWhatsappLead`, mesmo gatilho do broker Baileys — inbound, não-grupo, phone `55*`): upsert por `tenant_id+phone`, reflete nome forte, vincula `conversations.lead_id`, grava `lead_timeline` (`lead_created`).
  6. Grava `whatsapp_messages` (com `canonical_remote_jid = <phone>@s.whatsapp.net`) e espelha em `messages` (CRM), e atualiza `conversations` (status/`last_message_at`/`unread_count`).

### b.4 LID handling
- WhatsApp moderno roteia por **LID** (`remote_jid` termina em `@lid`). Regra canônica:
  - `remote_jid` do contato = **JID real** (`<phone>@s.whatsapp.net`);
  - `remote_jid_alt` = o **LID** original;
  - se chega LID e o contato tem `remote_jid` vazio/igual ao LID → bridge corrige (PATCH) para real + alt.
- Busca de contato tenta `remote_jid` → `remote_jid_alt` → `phone_number`. `normalizePhone` mantém os dígitos do LID para lookup.
- Outbound do SDR insere `remote_jid` = LID (como o WhatsApp roteia).

### b.5 Outbound — `pollOutbox` (loop de 3s)
- Poll `whatsapp_messages` `status='pending' AND from_me=true AND whatsapp_session_id=<bridge>` (ordem `created_at.asc`, limite 50).
- Para cada: `POST /message/sendText/wpp-alarcon` body `{number, text}` → sucesso: `status='sent'` + `whatsapp_message_id` da resposta (`d.key.id`); erro: `status='failed'`.
- ⚠️ Formato v2.3.7 correto do sendText: `{ "number": "...", "textMessage": { "text": "..." } }` (o bridge atual envia `text` solto — funcional no gateway, mas o formato oficial é `textMessage`).
- O app nunca chama a Evolution direto: escreve na outbox (`whatsapp_messages.pending`) e o bridge entrega.

---

## (c) SDR — `sdr-agent-worker` (PM2 `sdr-agent-worker`, no VPS)

- Fonte: `/opt/data/sdr-agent-worker/src/` (`index.ts`, `outbox.ts`, `qwen.ts`, `supabase.ts`).
- **Gate:** RPC `fn_sdr_should_reply(p_conv_id)` → retorna `has_history` e `exists_session`. Responde **só contato inédito** (sem histórico na conversa e sem sessão SDR ativa — regra de ouro: nunca responder base antiga). Para contato inédito o worker **auto-habilita `conversations.sdr_enabled=true`**.
- **Roteiro:** perguntas em `sdr_steps` (`order`, `is_active`), sessão em `sdr_sessions` (`status active` por `conversation_id`), respostas em `sdr_answers` (`session_id` + `step_code`).
- **Interpretação:** respostas livres passam pelo modelo (`qwen.ts`) para validar/classificar antes de gravar.
- **Envio:** `sendViaOutbox` insere em `whatsapp_messages` (`status='pending'`, `from_me=true`, `remote_jid` = LID) → entregue pelo `pollOutbox` do bridge (nenhum acoplamento direto com a Evolution).
- **Reflexo no funil:** ao disparar a 1ª pergunta, atualiza `leads.current_stage`/`conversation_stage` e `conversations.stage` para `STAGE_QUALIFICACAO_TXT` (padrão `Primeiro Atendimento / Qualificacao`).

---

## (d) Baileys (legado — PARADO) vs Evolution (novo — VIGENTE)

| Aspecto | Baileys (legado) | Evolution API (novo) |
|---|---|---|
| Status | **Parado/legado** — broker `whatsapp-broker` PM2 no VPS (`/root/crmahut/backend-broker`) | **Vigente** — Evolution v2.3.7 Docker (`localhost:8080`, instância `wpp-alarcon`) |
| Conexão | `sock` Baileys 7.x em processo próprio; QR gerado pelo broker | REST: `GET /instance/connect/{instance}` (QR ou pairing code); sessão persistida (`DATABASE_SAVE_DATA_INSTANCE`) |
| Sessões no app | 1 linha `whatsapp_sessions` (`default`) | 2 linhas: `default` (app) + `evolution-bridge` (interna, `provider='evolution'`) — status espelhado por `updateSessionStatus` |
| Inbound | handler interno do broker (Baileys events) | webhook → bridge :3099 → `MESSAGES_UPSERT` (payload `data` direto no v2.3.7) |
| Outbound | `sock.sendMessage` direto no poll da outbox | `pollOutbox` (bridge, 3s) → `POST /message/sendText/{instance}` |
| Mídia | download Baileys nativo → FFmpeg webm→ogg | `POST /message/getBase64FromMediaMessage` (`convertAudio:true`) → Storage |
| Bridge | inexistente (broker = tudo) | evolution-bridge réplica fiel do fluxo inbound do broker Baileys (mesmas tabelas, mesmo gatilho de lead) |
| Risco conhecido | restarts do broker deletavam `creds.json` | Redis obrigatório (`CACHE_REDIS_*`, não `REDIS_URI`) — senão `[Redis] disconnected` e envios pendurados |

**Regra:** novos desenvolvimentos consideram **somente** o fluxo Evolution. Baileys permanece como referência histórica/comportamental (o bridge replica o `ensureWhatsappLead` e a lógica de conversas dele).

---

## (e) Env vars & deploy

### Bridge (`.env` em `/root/evolution-bridge/.env`, ou `BRIDGE_ENV`)
| Var | Uso |
|---|---|
| `SUPABASE_URL` | base do projeto ptoch (PostgREST/Auth/Storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | chave service (bypassa RLS — nunca expor ao frontend) |
| `EVOLUTION_URL` | `http://localhost:8080` |
| `EVOLUTION_API_KEY` | apikey da Evolution |
| `EVOLUTION_INSTANCE` | `wpp-alarcon` |
| `ALARCON_TENANT_ID` | `a2c0a41e-8ae4-4c21-8b12-e0b319700908` |
| `EVO_PHONE` / `SESSION_PHONE` | `5511988192658` (número da sessão) |
| `PORT` | `3099` |

### SDR worker (`.env` do `sdr-agent-worker`)
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALARCON_TENANT_ID`, `WHATSAPP_SESSION_ID` (sessão bridge p/ outbox), `STAGE_QUALIFICACAO_TXT`, credenciais do modelo (`qwen.ts`).

### Evolution API (VPS `/opt/evolution-api/.env`)
`CACHE_REDIS_ENABLED=true`, `CACHE_REDIS_URI=redis://redis:6379/6`, `CACHE_REDIS_PREFIX_KEY=evolution_alarcon`, `CACHE_REDIS_SAVE_INSTANCES=true`, `DATABASE_SAVE_DATA_INSTANCE=true`. Webhook da instância aponta para `http://localhost:3099/` (events: `MESSAGES_UPSERT`, `SEND_MESSAGE`, `CONNECTION_UPDATE`).

### Deploy (pattern local `/opt/data/`)
- **`_deploy_all.py`** — deploy completo em 2 passos: (1) SFTP Hostinger (`82.25.73.206:65002`, user `u817195350`) → sobe `alarcon_repo/dist/**` para `domains/apexfyhub.com.br/public_html/testealarcon/` (backup do `index.html` antes); (2) SSH VPS (`2.24.95.98`, root) → SFTP `_evolution_bridge.js` → `/root/evolution-bridge/bridge.js` + `pm2 restart evolution-bridge` + tail dos logs.
- **`_deploy_bridge.py`** — só o passo (2): atualiza bridge no VPS e reinicia PM2.
- Fluxo de edição: editar `_evolution_bridge.js` (ou `src/` do frontend) → build → `_deploy_all.py` → validar → **commit no branch `remodel`** com entrada no `CHANGELOG_APEXFY.md`.

---

## Pontos de atenção (pitfalls)
1. **`connection.update` chega em lowercase** — sempre normalizar evento antes de comparar.
2. **Payload MESSAGES_UPSERT v2.3.7 = `data` direto** — código que espera `data.messages[]` recebe "upsert sem mensagens processáveis".
3. **Sessões duplas** — toda lógica de status deve atualizar `default` + `evolution-bridge`; atualizar só uma deixa o app preso em `qr_ready`.
4. **LID vs real** — `remote_jid` canônico = real; LID em `remote_jid_alt`. Nunca criar profile novo sem antes checar `whatsapp_contacts.remote_jid_alt` (evita duplicatas de perfis LID).
5. **`sendMedia` não aceita data-URI** nem multipart — JSON com base64 puro ou URL; nota de voz exige `ptt:true`.
6. **Redis da Evolution** — variáveis `CACHE_REDIS_*`; usar `REDIS_URI` quebra os envios.
7. **sendText oficial** = `{number, textMessage:{text}}`.