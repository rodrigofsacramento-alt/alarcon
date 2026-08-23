---
name: transcription-engine
description: "Motor de transcrição de áudio usando OpenAI Whisper para converter arquivos de áudio (MP3/WAV/etc) em texto estruturado."
version: "1.0.0"
---

# Transcription Engine Skill

Esta skill fornece ao agente a habilidade de converter arquivos de áudio locais em transcrições textuais precisas usando a API da OpenAI (Whisper).

## Quando usar
- Quando um usuário solicitar a transcrição de um arquivo de áudio (MP3, WAV, M4A, etc).
- Quando for necessário processar notas de reuniões de áudio para gerar resumos ou pautas.
- Para transformar áudios brutos em conteúdo base para a criação de rotinas, blog posts, ou roteiros.

## Pré-requisitos
- O arquivo de áudio deve estar acessível localmente no sistema.
- A variável de ambiente `OPENAI_API_KEY` deve estar corretamente configurada no arquivo `.env` na raiz do projeto.

## Como executar
O script base de transcrição está localizado em `scripts/transcribeAudio.js`. Para utilizá-lo, o agente deve rodar o seguinte comando via terminal:

```bash
node scripts/transcribeAudio.js "caminho/absoluto/ou/relativo/do/audio.mp3"
```

## Formato de Saída (Output)
O script irá gerar logs no console indicando o progresso. Ao finalizar, imprimirá a transcrição capturada.
O agente deve capturar esse output (via `run_command` com `manage_task` para ver o status/logs) e repassar a transcrição formatada para o usuário.

Exemplo de uso combinado:
1. Usar o `run_command` para executar a transcrição.
2. Ler a resposta logada da transcrição.
3. Repassar ao sistema de resumos (ex: `knowledge-management` ou content generator) ou apresentar o texto final ao usuário.
