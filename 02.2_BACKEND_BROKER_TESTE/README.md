# 02.2 — Backend Broker TESTE (WIP)

> ⚠️ **ESTADO ATUAL: BASE INICIAL — AMBIENTE DE TESTE PENDENTE DE CÓDIGO REAL**

Esta pasta é o **embarque inicial** da estrutura de broker de **teste/desenvolvimento** do CRM.
Neste momento ela é uma **cópia fiel do broker PROD** (pasta `02/ahut-whatsapp-broker`,
`session-manager.ts` hash `9eb2e374`), apenas para versionar a estrutura e não deixá-la vazia.

## ⚠️ IMPORTANTE (honestidade técnica)

- O **broker de TESTE real** vive na VPS em `/root/crmahut/backend-broker-dev` (PM2
  `rodrigo.whatsapp-broker-dev`), com **código distinto do PROD**:
  - `withRetry` (retries 3s/6s/11s em envio de áudio) e `reconnectSession`
  - `isHandshakeBroken`
  - Supabase **DEV** (`xmsulduzvufdzkfktovk`)
- Esse código **está ÓRFÃO**: não existe cópia em nenhum repositório local, e a VPS
  (`2.24.95.98`) está inacessível desta máquina (porta 22).
- Portanto o `session-manager.ts` **aqui é o do PROD** (`9eb2e374`), **NÃO** o de teste real.

## ✅ Único arquivo que NÃO é cópia do prod

- `src/audio-recovery.ts` presente no prod; o restante idêntico.

## TODO (quando houver acesso à VPS)

1. SSH em `2.24.95.98`: `cp -a /root/crmahut/backend-broker-dev/ src/`
2. Confirmar hash: deve começar com o código com `withRetry`/`isHandshakeBroken` (≠ `9eb2e374`)
3. Atualizar este README
4. Commit

## Infra de referência

| Item | Valor |
|---|---|
| Broker PROD | `/root/crmahut/backend-broker` (PM2 `whatsapp-broker`) |
| Broker TESTE | `/root/crmahut/backend-broker-dev` (PM2 `rodrigo.whatsapp-broker-dev`) |
| Supabase TESTE | `xmsulduzvufdzkfktovk` (DEV) |
| Dockerfile/tsconfig | presentes (padrão do prod) |