---
name: global-learning-loop
description: Diretriz global para que todos os agentes do squad aprendam com erros passados e evitem retrabalho.
---

# Diretriz de Aprendizado Contínuo (Knowledge Base)

Todos os agentes do Esquadrão Tech (Atom, Ada, Aura, Atlas, Aegis, Apollo, Argus, Aria, Ava) **DEVEM OBRIGATORIAMENTE** seguir esta regra:

Sempre que você (agente) enfrentar uma tarefa complexa, resolver um bug difícil, descobrir uma regra de negócio oculta ou encontrar uma solução definitiva que tomou tempo/tentativas para ser resolvida:
1. Você deve registrar esse aprendizado para os outros agentes.
2. Aprendizado segue o **PROTOCOLO_CONHECIMENTO.md** (`.agents/docs/`) aplicado no **P3 do Fluxo 6** — destino único por tipo de fato: técnica→skill do agente · regra nova→KB §7 · evento→PAINEL · história→CHANGELOG.
3. Antes de iniciar qualquer tarefa repetitiva ou que parece ter um padrão conhecido, consulte os destinos do protocolo (KB, PAINEL, skills) para testar diretamente a solução que já funcionou no passado.

**Objetivo:** Evitar queima de tokens atoa, reduzir retrabalho e garantir que o esquadrão tenha "memória técnica" de longo prazo. O Jarvis e o Argus irão monitorar o cumprimento desta regra.
