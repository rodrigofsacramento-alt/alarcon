# WhatsApp Broker - Estateia

Serviço Node.js para gerenciar conexões WhatsApp via Baileys (API não oficial).

## Requisitos

- Node.js 18+
- VPS com acesso à internet (para conectar ao WhatsApp)
- Service Role Key do Supabase

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env`:

```env
SUPABASE_URL=https://ptochsyoyatsydfysacc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
NODE_ENV=production
POLL_INTERVAL_MS=3000
LOG_LEVEL=info
```

> **Atenção:** Use a `SERVICE_ROLE_KEY`, não a `ANON_KEY`. A service role bypassa o RLS.

## Build

```bash
npm run build
```

## Execução

### Dev
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### PM2 (recomendado)
```bash
npm install -g pm2
pm2 start dist/index.js --name estateia-whatsapp
pm2 startup
pm2 save
```

### Docker
```bash
docker build -t estateia-whatsapp .
docker run -d --env-file .env --name estateia-whatsapp estateia-whatsapp
```

## Arquitetura

```
Frontend (React)  <--Realtime-->  Supabase (PostgreSQL)  <--Polling-->  Broker (Node.js)
     |                                |                                        |
  Usuário clica                Sessão 'connecting'                    Baileys gera QR
  "Conectar"                   Broker detecta e cria socket           Atualiza banco
                                                                    Usuário escaneia
                                                                    Status vira 'connected'
```

## Troubleshooting

### "Conectando..." infinito no frontend
O broker não está rodando. Verifique:
```bash
pm2 status
# ou
docker ps
```

### Erro de permissão no Supabase
Verifique se está usando a `SERVICE_ROLE_KEY`.

### QR Code não aparece
Verifique os logs:
```bash
pm2 logs estateia-whatsapp
```

## Notas de Segurança

- Nunca exponha a `SERVICE_ROLE_KEY` no frontend.
- O broker deve rodar em um servidor privado (VPS).
- As credenciais do WhatsApp (auth_info) são salvas localmente em `./auth_info/`.
