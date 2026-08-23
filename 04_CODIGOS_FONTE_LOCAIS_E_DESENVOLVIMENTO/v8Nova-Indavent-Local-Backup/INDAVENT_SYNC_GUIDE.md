# Guia de Sincronização e Comunicação: Frontend Next.js & Backend Broker (Nova Indavent)

Este documento descreve como o **Frontend Next.js** (hospedado na Hostinger Shared Hosting) e o **Backend Broker** (rodando na VPS via PM2) se comunicam e mantêm a sincronização em tempo real através do **Supabase**.

---

## 1. Topologia do Fluxo de Dados

A sincronização entre o frontend e o backend é **indireta e reativa**, o que significa que o frontend e o broker **nunca se comunicam diretamente por chamadas HTTP**. Toda a comunicação é mediada pelo banco de dados do Supabase.

```
┌─────────────────────────────────┐
│     Next.js Frontend (App)      │
│  Hospedagem: Hostinger Shared   │
└──────────────┬──────────────────┘
               │ (Leituras, Escritas e Realtime WebSockets)
               ▼
┌─────────────────────────────────┐
│       Banco de Dados            │
│       Supabase (Cloud)          │
└──────────────▲──────────────────┘
               │ (Polling & Escuta Realtime)
               ▼
┌─────────────────────────────────┐
│      Node.js Broker Service     │
│       Hospedagem: VPS           │
└─────────────────────────────────┘
```

* **Frontend**: Roda no navegador do usuário e faz consultas/subscrições no Supabase.
* **Supabase**: Armazena os dados, gerencia a segurança de acesso (RLS) e propaga eventos via WebSocket (Realtime).
* **Broker (VPS)**: Roda continuamente sob o PM2 na VPS, monitorando tabelas específicas do Supabase e interagindo diretamente com os servidores do WhatsApp.

---

## 2. Fluxos Detalhados de Sincronização

### Fluxo A: Conexão e Geração de QR Code

Quando o usuário deseja parear um dispositivo WhatsApp no painel do CRM:

```
[ CRM Frontend ] ──(1) Executa RPC start_whatsapp_session ──> [ Supabase DB ]
                                                                     │
                                                  (2) Atualiza status para 'connecting'
                                                                     │
[ VPS Broker ] <──(3) Escuta alteração via Realtime/Poll ────────────┘
      │
(4) Inicia WASocket (Baileys)
      │
(5) Recebe QR Code do WhatsApp
      │
      └───────────(6) Salva qr_code e status='qr_ready' ───> [ Supabase DB ]
                                                                     │
[ CRM Frontend ] <──(7) Recebe atualização via Realtime ─────────────┘
      │
(8) Exibe QR Code na Tela para o Usuário
```

1. **Ação do Usuário**: O usuário clica em "Conectar WhatsApp" no frontend.
2. **Chamada RPC**: O frontend executa a função RPC `start_whatsapp_session()`. Esta função define o `status` da sessão como `connecting` e limpa QR codes antigos.
3. **Reação do Broker**: O broker na VPS, rodando o loop de `pollSessions()`, detecta que a sessão está em estado `connecting` sem conexão ativa.
4. **Geração do QR Code**: O broker chama a biblioteca `Baileys` para obter o QR Code. Ao recebê-lo, o broker atualiza a linha correspondente no Supabase com o conteúdo Base64 em `qr_code` e muda o `status` para `qr_ready`.
5. **Atualização da UI**: O hook `useWhatsAppSession` no frontend, que está inscrito em tempo real no canal do Supabase, recebe a alteração e renderiza o QR Code na tela.
6. **Autenticação**: Assim que o usuário lê o QR Code pelo celular, o WhatsApp aprova a conexão. O broker detecta o evento de conexão bem-sucedida, salva as chaves criptográficas na coluna `auth_info`, limpa o `qr_code` do banco e define o status da sessão como `connected`.

---

### Fluxo B: Envio de Mensagem (Do CRM para o Cliente)

Quando um corretor digita e envia uma mensagem pela central de atendimento do CRM:

```
[ CRM Frontend ] ──(1) Executa RPC send_whatsapp_message ──> [ Supabase DB ]
                                                                     │
                                                 (2) Insere na tabela 'messages'
                                                 (3) Insere na tabela 'whatsapp_messages' (status='pending')
                                                                     │
[ VPS Broker ] <──(4) Escuta nova mensagem pendente ─────────────────┘
      │
(5) Envia mensagem para servidores do WhatsApp
      │
(6) Sucesso no envio
      │
      └───────────(7) Atualiza whatsapp_messages (status='sent') ──> [ Supabase DB ]
```

1. **Ação do Usuário**: O corretor envia uma mensagem de texto ou mídia.
2. **Escrita no Banco**: O frontend invoca a RPC `send_whatsapp_message()`. A RPC realiza duas inserções:
   - Na tabela `messages` (para histórico imediato do CRM, exibindo a mensagem com ícone de pendente).
   - Na tabela `whatsapp_messages` com o `status` definido como `pending` e `from_me = true`.
3. **Disparo do Broker**: O broker, via WebSocket Realtime ou polling de `pollOutgoingMessages()`, captura a mensagem pendente.
4. **Envio via Socket**: O broker utiliza a conexão do WhatsApp ativa para disparar a mensagem para o número do cliente (`remote_jid`).
5. **Atualização de Status**: Ao obter o retorno de sucesso do WhatsApp, o broker atualiza a linha em `whatsapp_messages` com o ID oficial da mensagem gerado pelo WhatsApp e define o `status` como `sent`.

---

### Fluxo C: Recebimento de Mensagem (Do Cliente para o CRM)

Quando o cliente responde pelo WhatsApp:

```
[ WhatsApp ] ──(1) Envia mensagem para o Broker ──> [ VPS Broker ]
                                                           │
                                           (2) Salva em 'whatsapp_messages' (from_me=false)
                                                           │
                                                           ▼
                                                    [ Supabase DB ]
                                                           │
                                           (3) Trigger DB atualiza 'conversations'
                                           (4) Trigger DB insere em 'messages'
                                                           │
[ CRM Frontend ] <──(5) Recebe nova mensagem via Realtime ─┘
      │
(6) Renderiza a nova mensagem no chat do corretor e toca alerta sonoro
```

1. **Entrada do Evento**: Os servidores do WhatsApp entregam a mensagem no socket do broker na VPS.
2. **Inserção de Origem**: O broker intercepta o evento `messages.upsert`, processa mídias e insere a mensagem na tabela `whatsapp_messages` (`from_me = false`).
3. **Automação no Banco (Triggers)**:
   - Um trigger no banco de dados detecta a inserção em `whatsapp_messages` e cria o registro na tabela principal de chat `messages`.
   - O trigger atualiza o campo `last_message_at` da conversa correspondente na tabela `conversations` para que ela suba no topo da lista.
4. **Propagação Realtime**: O canal de realtime do Supabase dispara a atualização para os clientes conectados.
5. **Atualização Visual**: A UI do CRM atualiza instantaneamente a listagem de conversas e a área de mensagens ativas da conversa aberta.

---

## 3. Lista de Checagem de Variáveis de Ambiente (Sincronização de Chaves)

Para que os dois lados permaneçam em perfeita sincronia, as credenciais e chaves do Supabase precisam estar alinhadas.

### 3.1 No Frontend Next.js (`.env.local` na Hostinger)
```env
NEXT_PUBLIC_SUPABASE_URL="https://ldfcqxeehgaftxsgxkag.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUPABASE_KEY_REDIGIDO"
```
* **Nota**: O frontend usa a chave **ANON** (anônima) para respeitar as políticas de RLS (Row Level Security), garantindo que um corretor só veja os dados de seu próprio `tenant_id`.

### 3.2 No Backend Broker (`.env` na VPS)
```env
SUPABASE_URL="https://ldfcqxeehgaftxsgxkag.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1..."
```
* **Importante**: O broker utiliza a chave **SERVICE_ROLE** (bypassa RLS). Isso é necessário porque o broker precisa gerenciar sessões e atualizar estados de mensagens de todos os inquilinos/tenants de forma centralizada e sem autenticação de usuário final.

---

## 4. Auditoria de Sincronização e Resolução de Problemas

Se o chat parar de funcionar ou apresentar atrasos na sincronização:

1. **Passo 1: Verifique a saúde do Broker na VPS:**
   Acesse o terminal da VPS e execute:
   ```bash
   pm2 status
   ```
   Certifique-se de que o processo `indavent-whatsapp-broker` está com o status `online` e o número de reinicializações (`↺`) está baixo.

2. **Passo 2: Analise os logs em tempo real:**
   ```bash
   pm2 logs indavent-whatsapp-broker --lines 50
   ```
   Verifique se há mensagens de erro de rede ou falha de credenciais do Supabase.

3. **Passo 3: Teste a conexão de rede da VPS com o Supabase:**
   Da VPS, verifique se há conectividade direta com o banco da Indavent:
   ```bash
   curl -I https://ldfcqxeehgaftxsgxkag.supabase.co
   ```
