# 🧠 SQUAD AGENTES IA — Índice de Perfis

**Fonte da verdade do organograma:** `04_CODIGOS_FONTE_LOCAIS_E_DESENVOLVIMENTO/ahut-ecosystem-active/codigo_engenharia_reversa_tsx/docs/audio-failsafe/ORGANOGRAMA_SQUAD_QUBITS.md`

**Regra:** a **skill** (`.agents/docs/<nome>`) é a fonte da regra de operação de cada agente; a **pasta** abaixo é o perfil/fluxo humano-legível. Todo agente tem BOTH.

---

## 📂 Índice de Pastas × Agente

| Pasta | Agente | Papel | Skill |
|---|---|---|---|
| `01_ATOM_DEVELOPER/` | 🛠️ ATOM | Engenheiro Sênior Full-Stack (Tech Lead) | `atom-agent-developer` |
| `02_AVA_TRIAGEM_IA/` | 🎙️ AVA | Triagem & Especificação Técnica | `ava-agent-intake` |
| `03_ORQUESTRADOR_CHIEF/` | 🧠 JARVIS | Orquestrador Chefe & CEO | `jarvis-orchestrator-chief` |
| `04_ARIA_MONITOR_LEADS/` | 📈 ARIA | Monitor de Leads | `aria-monitor-leads` |
| `05_ATLAS_DEVOPS_IA/` | 🚀 ATLAS | DevOps & Infraestrutura | `atlas-agent-devops` |
| `06_ADA_FRONTEND_UI/` | 🎨 ADA | Front-End / UI-UX | `ada-frontend-ui` |
| `07_ARGUS_SCRUM_MASTER/` | 👁️ ARGUS | Scrum Master & Processo | `argus-scrum-master` |
| `08_AURA_QA_TESTES/` | 🔍 AURA | QA & Testes | `aura-qa-tester` ⚠️ |
| `09_AEGIS_SECOPS/` | 🛡️ AEGIS | Security Ops | `aegis-secops` |
| `10_APOLLO_DATA_BI/` | 📊 APOLLO | Data & BI | `apollo-data-bi` |
| `11_AJAX_WHATSAPP_BROKER/` | 📱 AJAX | WhatsApp Business Specialist | `ajax-whatsapp-broker` |

⚠️ **AURA:** pasta de perfil criada, mas a skill `aura-qa-tester` está **vazia** no repo (não há SKILL.md) — ver item de pendência abaixo.

---

## 🧠 Hierarquia Oficial (resumo do organograma)
- **JARVIS** (CEO/Orquestrador) orquestra tudo; recebe demandas do Comandante, escala, revisa, aprova/recusa.
  - **ATOM** (Tech Lead) — valida tecnicamente → **ADA** (Front-End), **ATLAS** (DevOps), **AURA** (QA), **AEGIS** (SecOps).
  - **ARGUS** (Scrum Master, sob o ATOM) → **AVA** (Triagem), **APOLLO** (BI), **ARIA** (Leads).
- **AJAX** (especialista WhatsApp, reporta ao ATOM).

## ✅ Pendências resolvidas nesta padronização
- [x] **AURA:** pasta de perfil criada (`08_AURA_QA_TESTES/`) e skill `aura-qa-tester/SKILL.md` **restaurada ao HEAD** (faltava no disco — conhecimento de QA recuperado)
- [x] **Pastas de perfil** criadas para os 6 agentes que só tinham skill (ADA, ARGUS, AURA, AEGIS, APOLLO, AJAX)
- [ ] Manter pastas e skills **sempre sincronizadas** (novo agente → criar BOTH)