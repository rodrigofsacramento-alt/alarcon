# 📋 GUIA DO COMANDANTE — Como usar o Jarvis e o Squad

## 🎯 Comandos Rápidos (Telegram)

| Comando | O que faz | Quando usar |
|---|---|---|
| **`/go`** | Fluxo COMPLETO: diagnose → despacha AXIOM → executa → QA (prova visual) → performance → lacuna → aprendizado → TCK → Graph | **Sempre** que pedir uma tarefa técnica |
| **`/performance`** | Calcula o score da última entrega + análise de lacuna | Após cada entrega concluída |
| **`/criar-agente`** | Inicia o fluxo de criar um novo agente para o squad | Quando identificar um gap |
| **`/evolucao`** | Mostra o histórico de scores e agentes criados | Para acompanhar evolução do squad |
| **`/resumo`** | Status do squad hoje: agentes, skills, pendências | Qualquer momento |

> `/go` = antigo `/executar` — renomeado em 23/09. A semântica dos 3 gates não mudou.

## 📝 Formato ideal das suas mensagens

```
[Contexto rápido] + /go
```

**Exemplo bom:**
> "O áudio está falhando no cliente. Diagnostique e corrija. /go"

**Exemplo ruim:**
> "Faz ai o áudio"

## 🔄 O que acontece quando você usa /go

1. ✅ JARVIS valida a demanda e **despacha ao AXIOM** (orquestrador técnico)
2. ✅ AXIOM escolhe a topologia e os agentes executores (trabalham em paralelo)
3. ✅ AXIOM revisa + ensina no loop interno dev↔QA (máx 3 retries)
4. ✅ AURA faz QA (`tsc` + build **+ PROVA VISUAL real** — mesma régua do Gate 1)
5. ✅ ARGUS registra aprendizado (P3)
6. ✅ **5.5 🛑 GATE 2 — Deploy PROD só com aprovação SUA**
7. ✅ Deploy + commit (Fluxo 4 / KB §7)
8. ✅ **Pós-entrega obrigatório: P1-P6 do FLUXO 6** — performance (6 indicadores), análise de lacuna, captura de conhecimento (WRITE-LAST + TCK) e **Graph/Atlas como última etapa (P6)**

## 🧠 Como o squad evolui sozinho

```
CADA ENTREGA → Score de Performance (P1)
    │
    ▼
Análise de Lacuna (SEMPRE — P2)
    │
    ├── SIM → Crio agente novo
    │         │
    │         ▼
    │         Agente executa 10 tarefas
    │         │
    │         ├── 7/10 >80pts → 🎉 ASIMOV consolida a função de criar agentes
    │         │                  (JARVIS só valida)
    │         │
    │         └── <7/10 >80pts → Continua treinando
    │
    └── NÃO → Só registro aprendizado (P3)
```

## 🚫 O que NÃO fazer

- **Não peça permissão para eu executar** — o diagnóstico claro é suficiente
- **Não me explique coisas óbvias** — eu tenho o contexto do sistema
- **Não aceite "vou fazer"** — cobra o resultado feito (com prova visual)

## ✅ O que você vai ver de diferente AGORA

- Toda entrega terá um **Score de Performance** no final (P1)
- Toda entrega terá uma **Análise de Lacuna** (P2)
- Toda tarefa de código terá **PROVA VISUAL anexada** — sem ela, o Gate 1 RECUSA (sem exceção)
- Se criar um agente novo, ele terá **SKILL.md + PAINEL_DE_CONTROLE**
- O **Graph/Atlas** será atualizado ao fim de cada entrega (P6 — última etapa)
