# Evolution API — Guia de Integração (Broker WhatsApp AHUT)

> Pasta criada para estudo + implantação da **Evolution API** como camada de gateway WhatsApp,
> substituindo a gestão manual de sessão/reconexão do broker atual (que roda Baileys direto).
>
> A Evolution API **USA Baileys por dentro** — não é concorrente, é **envoltório REST+Webhooks**
> que resolve quedas, reconexão, multi-instância e QR. Nosso broker vira um cliente fino.
>
> **Regra de implantação deste repositório:** primeiro em **homologação**
> (`teste-ahut-ecosystem.apexfyhub.com.br`), só depois em produção.
> NÃO tocar no broker de produção (`/root/crmahut/backend-broker`) sem validação.

---

## ⚙️ Pré-requisitos (verificar na VPS antes de começar)

```bash
docker --version          # precisa existir (ou instalável)
docker compose version    # compose v2
curl -s https://hub.docker.com | head -1   # acesso ao Docker Hub
free -h | head -2         # memória suficiente (>= 1GB livre recomendado)
df -h /                   # disco livre (>= 2GB)
```

Se Docker não estiver instalado:
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # logout/login para valer
```

---

## 🚀 Passo a passo — subir a Evolution API

### 1) Criar a pasta de trabalho (já é a atual)
```bash
mkdir -p /opt/data/ahut-ecosystem-remodel-copy/02_BACKEND_E_SERVICOS_VPS/evolution-api
cd /opt/data/ahut-ecosystem-remodel-copy/02_BACKEND_E_SERVICOS_VPS/evolution-api
```

### 2) Configurar o `.env` (cole o conteúdo abaixo)
Crie o arquivo `.env`:
```bash
nano .env
```
```env
# ─── Evolução API — configuração base (NÃO commitar credenciais) ───
SERVER_URL=http://localhost:8080
AUTHENTICATION_API_KEY=<SUA_CHAVE_API_AQUI>
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://evolution:evolution@postgres:5432/evolution
DATABASE_SAVE_DATA_INSTANCE=true
DATABASE_SAVE_DATA_NEW_MESSAGE=true
DATABASE_SAVE_MESSAGE_UPDATE=true
DATABASE_SAVE_DATA_CONTACTS=true
DATABASE_SAVE_DATA_CHATS=true
DATABASE_SAVE_DATA_LABELS=true
DATABASE_SAVE_HISTORIC=true

# Conexão do tipo Baileys (WhatsApp Web)
CONNECTION_TYPE=baileys

# ⚠️ REDIS — usar CACHE_REDIS_* (NÃO REDIS_URI, nome errado causa "redis disconnected")
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://redis:6379/6
CACHE_REDIS_PREFIX_KEY=evolution_ahut
CACHE_REDIS_SAVE_INSTANCES=true
```
> 🔒 A `<SUA_CHAVE_API_AQUI>` deve ser trocada por uma chave forte (gerar com `openssl rand -hex 32`).
> Este `.env` **NUNCA deve ir para o git** — veja `.gitignore` na raiz.

### 3) Criar o `docker-compose.yml` (já incluso nesta pasta)
```bash
docker compose up -d
```

Isso sobe 3 serviços:
- **`evolution-api`** (porta 8080) — o gateway
- **`postgres`** (persistência: instâncias, contatos, mensagens)
- **`redis`** (cache + fila de mensagens)
*(ver arquivo `docker-compose.yml` nesta pasta)*

### 4) Verificar se subiu
```bash
docker compose ps          # 3 serviços "Up"
curl -s http://localhost:8080 | head -20   # responde com JSON do health
```

---

## 📱 Criar uma instância (conectar um número WhatsApp)

### 5) Criar a instância de TESTE
```bash
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: <SUA_CHAVE_API_AQUI>" \
  -d '{"instanceName":"wpp-ahut-teste","qrcode":true}'
```

### 6) Recuperar o QR code
```bash
curl -X GET http://localhost:8080/instance/connect/wpp-ahut-teste \
  -H "apikey: <SUA_CHAVE_API_AQUI>"
```
- Retorna um `base64` do QR → salve/abra no navegador ou converta.
- Escaneie com o WhatsApp (Configurações → Aparelhos conectados → **Vincular aparelho**).

### 7) Confirmar conexão
```bash
curl -X GET http://localhost:8080/instance/connectionState/wpp-ahut-teste \
  -H "apikey: <SUA_CHAVE_API_AQUI>"
```
Resultado esperado: `"state": "open"` → número conectado e estável.

---

## 🔌 Integrar o broker AHUT (webhook → Supabase)

### 8) Configurar o webhook de mensagens recebidas
Quando uma mensagem chegar, a Evolution avisa sua URL. Configure apontando para **o endpoint do seu broker (homologação)**:

```bash
curl -X POST http://localhost:8080/webhook/instance/wpp-ahut-teste \
  -H "Content-Type: application/json" \
  -H "apikey: <SUA_C...UI>" \
  -d '{
        "enabled": true,
        "url": "https://teste-ahut-ecosystem.apexfyhub.com.br/api/evolution-webhook",
        "webhook_by_events": false,
        "events": ["MESSAGES_UPSERT","MESSAGE_UPDATE","CONNECTION_UPDATE","SEND_MESSAGE"]
      }'
```

### 9) Enviar mensagem de TEXTO (formato REST oficial da Evolution)
```bash
curl -X POST http://localhost:8080/message/sendText/wpp-ahut-teste \
  -H "Content-Type: application/json" \
  -H "apikey: <SUA_C...UI>" \
  -d '{
        "number": "5511988192658",
        "textMessage": { "text": "Teste Evolution API — mensagem enviada via REST" }
      }'
```
> ⚠️ Campo é `textMessage` (objeto aninhado), NÃO `text` solto.

### 9b) Enviar MÍDIA (imagem/vídeo/áudio/documento) e outros formatos
- **Mídia:** `POST /message/sendMedia/wpp-ahut-teste` (`multipart/form-data`) com campos `number`, `mediatype` (`image`|`video`|`audio`|`document`), `media` (binário OR base64 OR URL), `caption`, `fileName`.
- **Outros formatos contemplados na documentação:** `sendContact` (vCard), `sendLocation`, `sendButtons`, `sendList`, `sendPoll`, `sendTemplate`, `sendReaction`.
- **Corpo e campos de cada um:** ver `docs-oficiais/07_formatos-de-envio.md`.

### 10) Mapear para o modelo do broker atual
O payload que a Evolution envia no webhook traz `remoteJid` (o mesmo campo que o broker atual usa).
No broker, o handler vira **cliente fino**:

```
EVOLUTION webhook
  └─ POST /api/evolution-webhook
       ├─ valida apikey
       ├─ extrai MESSAGES_UPSERT → remoteJid (LID) + message
       ├─ confere fn_sdr_should_reply (lead inédito)
       ├─ salva no Supabase (WHATSAPP_MESSAGES / MESSAGES)
       └─ dispara agente IA 24/7 → resposta via POST /message/sendText
```

---

## ✅ Checklist de verificação pós-migração (homologação)

- [ ] 3 serviços `Up` no `docker compose ps`
- [ ] `/instance/create` retorna a instância
- [ ] QR escaneado → `connectionState = open`
- [ ] Webhook configurado e eventos sendo recebidos no endpoint de homologação
- [ ] Envio REST responde e entrega no WhatsApp
- [ ] Áudio/media roundtrip OK (testar em iPhone e Android reais — regra das 10 Linhas Vermelhas)
- [ ] Sessão sobrevive a `docker compose restart` (reconexão automática)
- [ ] Registrar entrada no `CHANGELOG_APEXFY.md` (WRITE-LAST) + commitar

---

## ⚠️ Riscos e limites (honestidade técnica)

1. **Mesmo protocolo (WhatsApp Web/Baileys):** risco de banimento numérico NÃO é eliminado.
   Para >~1.000 conversas/mês ou produção crítica, a **Meta Cloud API oficial** é a única via "segura".
2. **Mais uma camada de infra** (container + Postgres + Redis): mais 1 serviço para monitorar,
   em troca de eliminar meses de bugs de reconexão.
3. **AUTHENTICATION_API_KEY:** nunca commitar. Rotacionar se vazar.
4. Nesta fase é ESTUDO/HOMOLOGAÇÃO — nada de produção.

---

## 📚 Referências úteis
- Repositório oficial: https://github.com/evolution-foundation/evolution-api
- Documentação/instalação: https://doc.evolution-api.com
- Docker Hub: `evoapicloud/evolution-api`