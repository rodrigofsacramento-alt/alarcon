> ## Documentation Index
> Fetch the complete documentation index at: https://docs.evolutionfoundation.com.br/llms.txt
> Use this file to discover all available pages before exploring further.

# Webhooks

Os Webhooks permitem integração em tempo real entre a Evolution API e o WhatsApp™, permitindo sincronização e compartilhamento automatizados de dados.

É exatamente esse recurso que possibilita a criação de bots de autoatendimento e sistemas multi-serviço.

## Ativando Webhooks

Existem duas maneiras de ativar o webhook:

* No arquivo `.env` com eventos globais
* Chamando o endpoint `/webhook/instance`

### Eventos de webhook da instância

A maioria dos usuários preferirá a ativação por instância, desta forma é mais fácil controlar os eventos recebidos, no entanto em alguns casos é necessário um webhook global,
isso pode ser feito usando a variável de webhook global.

Aqui está um exemplo com alguns eventos comuns ouvidos:

```json /webhook/instance theme={null}
{
  "url": "{{webhookUrl}}",
  "webhook_by_events": false,
  "webhook_base64": false,
  "events": [
      "QRCODE_UPDATED",
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "MESSAGES_DELETE",
      "SEND_MESSAGE",
      "CONNECTION_UPDATE",
      "TYPEBOT_START",
      "TYPEBOT_CHANGE_STATUS"
  ]
}
```

### Parâmetros

| Parâmetro           | Tipo    | Obrigatório | Descrição                                                                                                       |
| ------------------- | ------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| enabled             | boolean | Sim         | Insira "true" para criar ou alterar dados do Webhook, ou "false" se quiser parar de usá-lo.                     |
| url                 | string  | Sim         | URL do Webhook para receber dados do evento.                                                                    |
| webhook\_by\_events | boolean | Não         | Deseja gerar uma URL específica do Webhook para cada um dos seus eventos.                                       |
| events              | array   | Não         | Lista de eventos a serem processados. Se você não quiser usar alguns desses eventos, apenas remova-os da lista. |

<Note>
  É extremamente necessário que o payload obedeça às regras para criar um arquivo JSON, considerando o arranjo correto de itens, formatação, colchetes, chaves e vírgulas, etc.
  Antes de consumir o endpoint, se tiver dúvidas sobre a formatação JSON, vá para [https://jsonlint.com/](https://jsonlint.com/) e valide.
</Note>

### Eventos Globais de Webhook

Cada URL e eventos de Webhook da instância serão solicitados no momento em que forem criados
Defina um webhook global que ouvirá eventos habilitados de todas as instâncias

```bash .env theme={null}
WEBHOOK_GLOBAL_URL=''
WEBHOOK_GLOBAL_ENABLED=false

# Com esta opção ativada, você trabalha com uma URL por evento de webhook, respeitando a URL global e o nome de cada evento
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false

## Defina os eventos que você deseja ouvir, todos os eventos listados abaixo são suportados
WEBHOOK_EVENTS_APPLICATION_STARTUP=false
WEBHOOK_EVENTS_QRCODE_UPDATED=true

# Alguns eventos extras para erros
WEBHOOK_EVENTS_ERRORS=false
WEBHOOK_EVENTS_ERRORS_WEBHOOK=
```

## Eventos Suportados

Estes são os eventos de webhook disponíveis e suportados:

| **Variável de ambiente**    | **URL**                    | **Descrição**                                                                                                                                                                    |
| --------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APPLICATION\_STARTUP        | /application-startup       | Notifica quando uma inicialização de aplicativo ocorre                                                                                                                           |
| QRCODE\_UPDATED             | /qrcode-updated            | Envia o base64 do qrcode para leitura                                                                                                                                            |
| CONNECTION\_UPDATE          | /connection-update         | Informa o status da conexão com o WhatsApp                                                                                                                                       |
| MESSAGES\_SET               | /messages-set              | Envia uma lista de todas as suas mensagens carregadas no WhatsApp. Este evento ocorre apenas uma vez                                                                             |
| MESSAGES\_UPSERT            | /messages-upsert           | Notifica quando uma mensagem é recebida                                                                                                                                          |
| MESSAGES\_UPDATE            | /messages-update           | Informa quando uma mensagem é atualizada                                                                                                                                         |
| MESSAGES\_DELETE            | /messages-delete           | Informa quando uma mensagem é excluída                                                                                                                                           |
| SEND\_MESSAGE               | /send-message              | Notifica quando uma mensagem é enviada                                                                                                                                           |
| CONTACTS\_SET               | /contacts-set              | Realiza o carregamento inicial de todos os contatos. Este evento ocorre apenas uma vez                                                                                           |
| CONTACTS\_UPSERT            | /contacts-upsert           | Recarrega todos os contatos com informações adicionais. Este evento ocorre apenas uma vez                                                                                        |
| CONTACTS\_UPDATE            | /contacts-update           | Informa quando o contato é atualizado                                                                                                                                            |
| PRESENCE\_UPDATE            | /presence-update           | Informa se o usuário está online, se ele está realizando alguma ação como escrever ou gravar e seu último visto: 'indisponível', 'disponível', 'compondo', 'gravando', 'pausado' |
| CHATS\_SET                  | /chats-set                 | Envia uma lista de todos os chats carregados                                                                                                                                     |
| CHATS\_UPDATE               | /chats-update              | Informa quando o chat é atualizado                                                                                                                                               |
| CHATS\_UPSERT               | /chats-upsert              | Envia qualquer nova informação de chat                                                                                                                                           |
| CHATS\_DELETE               | /chats-delete              | Notifica quando um chat é excluído                                                                                                                                               |
| GROUPS\_UPSERT              | /groups-upsert             | Notifica quando um grupo é criado                                                                                                                                                |
| GROUPS\_UPDATE              | /groups-update             | Notifica quando um grupo tem suas informações atualizadas                                                                                                                        |
| GROUP\_PARTICIPANTS\_UPDATE | /group-participants-update | Notifica quando uma ação ocorre envolvendo um participante: 'adicionar', 'remover', 'promover', 'rebaixar'                                                                       |
| NEW\_TOKEN                  | /new-jwt                   | Notifica quando o token (jwt) é atualizado                                                                                                                                       |

## Webhook por eventos

Ao habilitar as opções WEBHOOK\_BY\_EVENTS nos webhooks globais e locais, os seguintes caminhos serão adicionados ao final do webhook.

<Note>
  Adicione ao final da URL o nome do evento com um traço (-) entre as palavras que compõem o evento.
</Note>

### Exemplo

Supondo que sua URL de webhook fosse `https://sub.domain.com/webhook/`. A Evolution adicionará automaticamente ao final da URL o nome do evento quando `webhook_by_events` estiver definido como verdadeiro.

| **Evento**                  | **Nova URL de Webhook por Eventos**                        |
| --------------------------- | ---------------------------------------------------------- |
| APPLICATION\_STARTUP        | `https://sub.domain.com/webhook/application-startup`       |
| QRCODE\_UPDATED             | `https://sub.domain.com/webhook/qrcode-updated`            |
| CONNECTION\_UPDATE          | `https://sub.domain.com/webhook/connection-update`         |
| MESSAGES\_SET               | `https://sub.domain.com/webhook/messages-set`              |
| MESSAGES\_UPSERT            | `https://sub.domain.com/webhook/messages-upsert`           |
| MESSAGES\_UPDATE            | `https://sub.domain.com/webhook/messages-update`           |
| MESSAGES\_DELETE            | `https://sub.domain.com/webhook/messages-delete`           |
| SEND\_MESSAGE               | `https://sub.domain.com/webhook/send-message`              |
| CONTACTS\_SET               | `https://sub.domain.com/webhook/contacts-set`              |
| CONTACTS\_UPSERT            | `https://sub.domain.com/webhook/contacts-upsert`           |
| CONTACTS\_UPDATE            | `https://sub.domain.com/webhook/contacts-update`           |
| PRESENCE\_UPDATE            | `https://sub.domain.com/webhook/presence-update`           |
| CHATS\_SET                  | `https://sub.domain.com/webhook/chats-set`                 |
| CHATS\_UPDATE               | `https://sub.domain.com/webhook/chats-update`              |
| CHATS\_UPSERT               | `https://sub.domain.com/webhook/chats-upsert`              |
| CHATS\_DELETE               | `https://sub.domain.com/webhook/chats-delete`              |
| GROUPS\_UPSERT              | `https://sub.domain.com/webhook/groups-upsert`             |
| GROUPS\_UPDATE              | `https://sub.domain.com/webhook/groups-update`             |
| GROUP\_PARTICIPANTS\_UPDATE | `https://sub.domain.com/webhook/group-participants-update` |
| NEW\_TOKEN                  | `https://sub.domain.com/webhook/new-jwt`                   |

## Localizando Webhook

Se necessário, há uma opção para localizar qualquer webhook ativo na instância específica.

| Método | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | \[baseUrl]/webhook/find/\[instance] |

### Dados retornados da solicitação:

Chamando o endpoint retornará todas as informações sobre o webhook que está sendo usado pela instância.

```json Resultado theme={null}
{
  "enabled": true,
  "url": "[url]",
  "webhookByEvents": false,
  "events": [
    [eventos]
  ]
}
```
