> ## Documentation Index
> Fetch the complete documentation index at: https://docs.evolutionfoundation.com.br/llms.txt
> Use this file to discover all available pages before exploring further.

# Variáveis de Ambiente

Veja o arquivo de exemplo do env no <a href="https://github.com/evolution-foundation/evolution-api/blob/main/.env.example" target="_blank">repositório oficial</a>.

## Server

| Variável     | Valor                                                                                                                                 | Exemplo                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| SERVER\_TYPE | O tipo de servidor (http ou https)                                                                                                    | http                                |
| SERVER\_PORT | Porta em que o servidor será executado                                                                                                | 8080                                |
| SERVER\_URL  | O endereço para seu servidor em execução. Esse endereço é utilizado para retornar dados de requisição interna, como links de webhook. | `https://exemplo.evolution-api.com` |

## Telemetria

| Variável       | Valor                                               | Exemplo                         |
| -------------- | --------------------------------------------------- | ------------------------------- |
| TELEMETRY      | Habilita ou desabilita a telemetria (true ou false) | true                            |
| TELEMETRY\_URL | URL do servidor de telemetria                       | `https://telemetry.example.com` |

## CORS

| Variável          | Valor                                                                                                           | Exemplo             |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | ------------------- |
| CORS\_ORIGIN      | As origens permitidas pela API separadas por vírgula (utilize "\*" para aceitar requisições de qualquer origem) | \*                  |
| CORS\_METHODS     | Métodos HTTP permitidos separados por vírgula                                                                   | GET,POST,PUT,DELETE |
| CORS\_CREDENTIALS | Permissão de cookies em requisições (true ou false)                                                             | true                |

## Logs

| Variável     | Valor                                                                                           | Exemplo                                         |
| ------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| LOG\_LEVEL   | Logs que serão mostrados entre: ERROR, WARN, DEBUG, INFO, LOG, VERBOSE, DARK, WEBHOOKS          | ERROR,WARN,DEBUG,INFO,LOG,VERBOSE,DARK,WEBHOOKS |
| LOG\_COLOR   | Mostrar ou não cores nos Logs (true ou false)                                                   | true                                            |
| LOG\_BAILEYS | Quais logs da Baileys serão mostrados entre: "fatal", "error", "warn", "info", "debug", "trace" | error                                           |

## Instâncias

| Variável      | Valor                                                                                           | Exemplo |
| ------------- | ----------------------------------------------------------------------------------------------- | ------- |
| DEL\_INSTANCE | Em quantos minutos uma instância será excluída se não conectada. Use "false" para nunca excluir | false   |

## Armazenamento Persistente

| Variável                           | Valor                                                                                                                        | Exemplo                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| DATABASE\_ENABLED                  | Se o armazenamento persistente está habilitado (true ou false)                                                               | true                                                            |
| DATABASE\_PROVIDER                 | Provedor de banco de dados (postgresql ou mysql)                                                                             | postgresql                                                      |
| DATABASE\_CONNECTION\_URI          | A URI de conexão do banco de dados                                                                                           | `postgresql://user:pass@localhost:5432/evolution?schema=public` |
| DATABASE\_CONNECTION\_CLIENT\_NAME | Nome do cliente para a conexão com o banco de dados, usado para separar uma instalação da API de outra que usa o mesmo banco | evolution\_exchange                                             |

### Quais dados serão salvos (true ou false)

| Variável                           | Valor                           |
| ---------------------------------- | ------------------------------- |
| DATABASE\_SAVE\_DATA\_INSTANCE     | Salva dados de instâncias       |
| DATABASE\_SAVE\_DATA\_NEW\_MESSAGE | Salva novas mensagens           |
| DATABASE\_SAVE\_MESSAGE\_UPDATE    | Salva atualizações de mensagens |
| DATABASE\_SAVE\_DATA\_CONTACTS     | Salva contatos                  |
| DATABASE\_SAVE\_DATA\_CHATS        | Salva conversas                 |
| DATABASE\_SAVE\_DATA\_LABELS       | Salva etiquetas                 |
| DATABASE\_SAVE\_DATA\_HISTORIC     | Salva histórico de eventos      |

## RabbitMQ

| Variável                  | Valor                                               | Exemplo            |
| ------------------------- | --------------------------------------------------- | ------------------ |
| RABBITMQ\_ENABLED         | Habilita o RabbitMQ (true ou false)                 | false              |
| RABBITMQ\_URI             | URI de conexão do RabbitMQ                          | `amqp://localhost` |
| RABBITMQ\_EXCHANGE\_NAME  | Nome do exchange                                    | evolution          |
| RABBITMQ\_GLOBAL\_ENABLED | Habilita o RabbitMQ de forma global (true ou false) | false              |

### Escolha os eventos que deseja enviar para o RabbitMQ

| Variável                                      | Valor                                                                                                    | Exemplo |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------- |
| RABBITMQ\_EVENTS\_APPLICATION\_STARTUP        | Envia um evento na inicialização do app (true ou false)                                                  | false   |
| RABBITMQ\_EVENTS\_INSTANCE\_CREATE            | Envia eventos de criação de instância (true ou false)                                                    | false   |
| RABBITMQ\_EVENTS\_INSTANCE\_DELETE            | Envia eventos de deleção de instância (true ou false)                                                    | false   |
| RABBITMQ\_EVENTS\_QRCODE\_UPDATED             | Envia eventos de atualização do QR Code (true ou false)                                                  | false   |
| RABBITMQ\_EVENTS\_MESSAGES\_SET               | Envia eventos de criação de mensagens (recuperação de mensagens) (true ou false)                         | false   |
| RABBITMQ\_EVENTS\_MESSAGES\_UPSERT            | Envia eventos de recebimento de mensagens (true ou false)                                                | false   |
| RABBITMQ\_EVENTS\_MESSAGES\_EDITED            | Envia eventos de edição de mensagens (true ou false)                                                     | false   |
| RABBITMQ\_EVENTS\_MESSAGES\_UPDATE            | Envia eventos de atualização de mensagens (true ou false)                                                | false   |
| RABBITMQ\_EVENTS\_MESSAGES\_DELETE            | Envia eventos de deleção de mensagens (true ou false)                                                    | false   |
| RABBITMQ\_EVENTS\_SEND\_MESSAGE               | Envia eventos de envio de mensagens (true ou false)                                                      | false   |
| RABBITMQ\_EVENTS\_CONTACTS\_SET               | Envia eventos de criação de contatos (true ou false)                                                     | false   |
| RABBITMQ\_EVENTS\_CONTACTS\_UPSERT            | Envia eventos de recuperação de contatos (true ou false)                                                 | false   |
| RABBITMQ\_EVENTS\_CONTACTS\_UPDATE            | Envia eventos de atualização de contatos (true ou false)                                                 | false   |
| RABBITMQ\_EVENTS\_PRESENCE\_UPDATE            | Envia eventos de atualização de presença ("digitando..." ou "gravando...") (true ou false)               | false   |
| RABBITMQ\_EVENTS\_CHATS\_SET                  | Envia eventos de criação de conversas (recuperação de conversas) (true ou false)                         | false   |
| RABBITMQ\_EVENTS\_CHATS\_UPSERT               | Envia eventos de criação de conversas (recebimento ou envio de mensagens em novos chats) (true ou false) | false   |
| RABBITMQ\_EVENTS\_CHATS\_UPDATE               | Envia eventos de atualização de conversas (true ou false)                                                | false   |
| RABBITMQ\_EVENTS\_CHATS\_DELETE               | Envia eventos de deleção de conversas (true ou false)                                                    | false   |
| RABBITMQ\_EVENTS\_GROUPS\_UPSERT              | Envia eventos de criação de grupos (true ou false)                                                       | false   |
| RABBITMQ\_EVENTS\_GROUP\_UPDATE               | Envia eventos de atualização de grupos (true ou false)                                                   | false   |
| RABBITMQ\_EVENTS\_GROUP\_PARTICIPANTS\_UPDATE | Envia eventos de atualização nos participantes de grupos (true ou false)                                 | false   |
| RABBITMQ\_EVENTS\_CONNECTION\_UPDATE          | Envia eventos de atualização de conexão (true ou false)                                                  | false   |
| RABBITMQ\_EVENTS\_CALL                        | Envia eventos de chamadas (true ou false)                                                                | false   |
| RABBITMQ\_EVENTS\_TYPEBOT\_START              | Envia eventos de início de fluxo do Typebot (true ou false)                                              | false   |
| RABBITMQ\_EVENTS\_TYPEBOT\_CHANGE\_STATUS     | Envia eventos de atualização no status do Typebot (true ou false)                                        | false   |

## SQS

| Variável                 | Valor                                    | Exemplo |
| ------------------------ | ---------------------------------------- | ------- |
| SQS\_ENABLED             | Se o SQS está habilitado (true ou false) | false   |
| SQS\_ACCESS\_KEY\_ID     | O ID de chave do SQS                     | -       |
| SQS\_SECRET\_ACCESS\_KEY | Chave de acesso                          | -       |
| SQS\_ACCOUNT\_ID         | ID da conta                              | -       |
| SQS\_REGION              | Região do SQS                            | -       |

## WebSocket

| Variável                  | Valor                                                 | Exemplo |
| ------------------------- | ----------------------------------------------------- | ------- |
| WEBSOCKET\_ENABLED        | Habilita o WebSocket (true ou false)                  | false   |
| WEBSOCKET\_GLOBAL\_EVENTS | Habilita eventos globais no WebSocket (true ou false) | false   |

## WhatsApp Business API

| Variável                     | Valor                                              | Exemplo                      |
| ---------------------------- | -------------------------------------------------- | ---------------------------- |
| WA\_BUSINESS\_TOKEN\_WEBHOOK | Token usado para validar o webhook no Facebook APP | evolution                    |
| WA\_BUSINESS\_URL            | URL da API do WhatsApp Business                    | `https://graph.facebook.com` |
| WA\_BUSINESS\_VERSION        | Versão da API do WhatsApp Business                 | v20.0                        |
| WA\_BUSINESS\_LANGUAGE       | Idioma da API do WhatsApp Business                 | en\_US                       |

## Webhook Global

| Variável                             | Valor                                                                                      | Exemplo                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------- |
| WEBHOOK\_GLOBAL\_ENABLED             | Se os webhooks estão habilitados globalmente (true ou false)                               | false                         |
| WEBHOOK\_GLOBAL\_URL                 | URL que receberá as requisições de webhook                                                 | `https://webhook.example.com` |
| WEBHOOK\_GLOBAL\_WEBHOOK\_BY\_EVENTS | Ativa webhook por evento, respeitando a URL global e o nome de cada evento (true ou false) | false                         |

### Eventos de webhook com valor true ou false

| Variável                                     |
| -------------------------------------------- |
| WEBHOOK\_EVENTS\_APPLICATION\_STARTUP        |
| WEBHOOK\_EVENTS\_QRCODE\_UPDATED             |
| WEBHOOK\_EVENTS\_MESSAGES\_SET               |
| WEBHOOK\_EVENTS\_MESSAGES\_UPSERT            |
| WEBHOOK\_EVENTS\_MESSAGES\_EDITED            |
| WEBHOOK\_EVENTS\_MESSAGES\_UPDATE            |
| WEBHOOK\_EVENTS\_MESSAGES\_DELETE            |
| WEBHOOK\_EVENTS\_SEND\_MESSAGE               |
| WEBHOOK\_EVENTS\_CONTACTS\_SET               |
| WEBHOOK\_EVENTS\_CONTACTS\_UPSERT            |
| WEBHOOK\_EVENTS\_CONTACTS\_UPDATE            |
| WEBHOOK\_EVENTS\_PRESENCE\_UPDATE            |
| WEBHOOK\_EVENTS\_CHATS\_SET                  |
| WEBHOOK\_EVENTS\_CHATS\_UPSERT               |
| WEBHOOK\_EVENTS\_CHATS\_UPDATE               |
| WEBHOOK\_EVENTS\_CHATS\_DELETE               |
| WEBHOOK\_EVENTS\_GROUPS\_UPSERT              |
| WEBHOOK\_EVENTS\_GROUPS\_UPDATE              |
| WEBHOOK\_EVENTS\_GROUP\_PARTICIPANTS\_UPDATE |
| WEBHOOK\_EVENTS\_CONNECTION\_UPDATE          |
| WEBHOOK\_EVENTS\_LABELS\_EDIT                |
| WEBHOOK\_EVENTS\_LABELS\_ASSOCIATION         |
| WEBHOOK\_EVENTS\_CALL                        |
| WEBHOOK\_EVENTS\_TYPEBOT\_START              |
| WEBHOOK\_EVENTS\_TYPEBOT\_CHANGE\_STATUS     |
| WEBHOOK\_EVENTS\_ERRORS                      |
| WEBHOOK\_EVENTS\_ERRORS\_WEBHOOK             |

## Configurações de Sessão

| Variável                       | Valor                                                    | Exemplo       |
| ------------------------------ | -------------------------------------------------------- | ------------- |
| CONFIG\_SESSION\_PHONE\_CLIENT | Nome que será exibido na conexão do smartphone           | Evolution API |
| CONFIG\_SESSION\_PHONE\_NAME   | Nome do navegador (Chrome, Firefox, Edge, Opera, Safari) | Chrome        |

## QR Code

| Variável      | Valor                             | Exemplo |
| ------------- | --------------------------------- | ------- |
| QRCODE\_LIMIT | Por quanto tempo o QR code durará | 30      |
| QRCODE\_COLOR | Cor do QR code gerado             | #175197 |

## Typebot

| Variável              | Valor                                 | Exemplo |
| --------------------- | ------------------------------------- | ------- |
| TYPEBOT\_API\_VERSION | Versão da API (versão fixa ou latest) | latest  |

## Chatwoot

| Variável                                      | Valor                                                                                                       | Exemplo                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| CHATWOOT\_ENABLED                             | Habilita a integração com Chatwoot (true ou false)                                                          | false                                                           |
| CHATWOOT\_MESSAGE\_READ                       | Marca como lida a última mensagem do cliente no WhatsApp ao enviar uma mensagem no Chatwoot (true ou false) | true                                                            |
| CHATWOOT\_MESSAGE\_DELETE                     | Deleta a mensagem no Chatwoot quando deletada no WhatsApp (true ou false)                                   | true                                                            |
| CHATWOOT\_IMPORT\_DATABASE\_CONNECTION\_URI   | URI de conexão com o banco de dados do Chatwoot para importar mensagens                                     | `postgresql://user:password@host:5432/chatwoot?sslmode=disable` |
| CHATWOOT\_IMPORT\_PLACEHOLDER\_MEDIA\_MESSAGE | Importa as mensagens de mídia como placeholder no Chatwoot (true ou false)                                  | true                                                            |

## OpenAI

| Variável        | Valor                                            | Exemplo |
| --------------- | ------------------------------------------------ | ------- |
| OPENAI\_ENABLED | Habilita a integração com OpenAI (true ou false) | false   |

## Dify

| Variável      | Valor                                          | Exemplo |
| ------------- | ---------------------------------------------- | ------- |
| DIFY\_ENABLED | Habilita a integração com Dify (true ou false) | false   |

## Cache

| Variável                      | Valor                                                                            | Exemplo                    |
| ----------------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| CACHE\_REDIS\_ENABLED         | Habilita o cache Redis (true ou false)                                           | true                       |
| CACHE\_REDIS\_URI             | A URI de conexão do Redis                                                        | `redis://localhost:6379/6` |
| CACHE\_REDIS\_PREFIX\_KEY     | Prefixo para diferenciar dados de uma instalação para outra usando o mesmo Redis | evolution                  |
| CACHE\_REDIS\_SAVE\_INSTANCES | Salva as credenciais de conexão do WhatsApp no Redis (true ou false)             | false                      |
| CACHE\_LOCAL\_ENABLED         | Habilita o cache local em memória como alternativa ao Redis (true ou false)      | false                      |

## Amazon S3 / MinIO

| Variável        | Valor                                          | Exemplo          |
| --------------- | ---------------------------------------------- | ---------------- |
| S3\_ENABLED     | Habilita o armazenamento no S3 (true ou false) | false            |
| S3\_ACCESS\_KEY | Chave de acesso do S3                          | -                |
| S3\_SECRET\_KEY | Chave secreta do S3                            | -                |
| S3\_BUCKET      | Nome do bucket no S3                           | evolution        |
| S3\_PORT        | Porta de conexão ao S3                         | 443              |
| S3\_ENDPOINT    | Endpoint do S3 (ou MinIO)                      | s3.amazonaws.com |
| S3\_USE\_SSL    | Usa SSL para conexão ao S3 (true ou false)     | true             |

## Autenticação

| Variável                                     | Valor                                                    | Exemplo                          |
| -------------------------------------------- | -------------------------------------------------------- | -------------------------------- |
| AUTHENTICATION\_API\_KEY                     | Chave da API usada para autenticação global              | 429683C4C977415CAAFCCE10F7D57E11 |
| AUTHENTICATION\_EXPOSE\_IN\_FETCH\_INSTANCES | Exibe as instâncias no endpoint de fetch (true ou false) | true                             |

## Idioma

| Variável | Valor         | Exemplo |
| -------- | ------------- | ------- |
| LANGUAGE | Idioma da API | en      |
