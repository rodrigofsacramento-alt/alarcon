# Evolution API — Formatos de Envio de Arquivo Contemplados

> Consolidado por Jarvis em 22/09 a partir da documentação oficial da **Evolution Foundation** (v2.3.7).
> Fonte: https://docs.evolutionfoundation.com.br/llms-full.txt e OpenAPI `message.yaml`.
> Toda rota: `POST http://localhost:8080/message/<rota>/{instanceName}` + header `apikey`.

## Formato do corpo — MENSAGEM DE TEXTO (`sendText`)
```json
{
  "number": "5511988192658",
  "textMessage": { "text": "Olá!" }
}
```
⚠️ Campo é `textMessage` (objeto), **NÃO** `text` solto.

## MÍDIA — `sendMedia` (unifica imagem/vídeo/áudio/documento)
`POST /message/sendMedia/{instanceName}` — **multipart/form-data**
| Campo | Tipo | Obrigatório |
|---|---|---|
| `number` | string | ✅ |
| `mediatype` | `image` \| `video` \| `audio` \| `document` | ✅ |
| `media` | binário OR base64 OR **URL** | ✅ |
| `caption` | string | — |
| `fileName` | string | — |

## Tabela completa de formatos de arquivo contemplados
| Rota | Tipo de conteúdo | Observações |
|---|---|---|
| `sendText` | Texto | JSON `textMessage` |
| `sendMedia` (`image`) | **Imagem** JPG/PNG | multipart |
| `sendMedia` (`video`) | **Vídeo** MP4 | multipart |
| `sendMedia` (`audio`) | **Áudio** OGG-Opus/MP3/M4A (PTT voz ou música) | multipart, `ptt:true` = nota de voz |
| `sendMedia` (`document`) | **Documento/anexo** PDF/DOC/XLS | multipart + `fileName` |
| `sendContact` | **Contato / vCard** | JSON |
| `sendLocation` | **Localização** | JSON lat/long |
| `sendButtons` | **Botões interativos** | JSON |
| `sendList` | **Lista interativa** | JSON sections/rows |
| `sendPoll` | **Enquete** | JSON question+options |
| `sendTemplate` | **Template (Business/Cloud API)** | JSON |
| `sendReaction` | **Reação emoji** | JSON emoji+messageId |

## Recebimento (webhook) — tipos de mídia
No payload `MESSAGES_UPSERT`, `data.message.messageType` / `Info.MediaType` pode ser:
`text | image | video | audio | document | contact | location | sticker | groupInvite` — reporta também `imageMessage`, `videoMessage`, `audioMessage`, `documentMessage`.
Áudio de voz (`ptt:true`) → `audioMessage.mimetype = audio/ogg; codecs=opus` (mesmo pipeline FFmpeg).
