# ANTIGRAVITY — RELATÓRIO DE PARIDADE (bundle de produção × reidratado)

**Data:** 08/set/2026 · **Autor:** Jarvis (Orquestrador)  
**Comparado:** `1.1_FRONTEND_PROD_TESTE/dist/assets/*.js` (produção teste-ahut, LIGHT) × `00_ANTIGRAVITY_FASE3_CORRECCION/check/src/**` (reidratado Fase 3-C)

## 1. Paridade estrutural (chunks → páginas)
- **Chunks de produção: 73** `.js` · **Arquivos reidratados: 209** `.tsx/.ts` (`find` total 210, 1 é página extra duplicada)
- **Cobertura de chunks: 100%** — nenhum `.js` de produção sem `.tsx` correspondente (por nome-sem-hash).
- **Hash de identidade do chunk-alvo:** `Atendimento-live-v14.js` md5 `9133ffc7` == SOP (produção intacta).

## 2. Verificação e.jsx → JSX
- **Bundle:** 6.176 ocorrências `e.jsx(` (formato minificado de produção).
- **Reidratado:** 0 `e.jsx(` · 13.394 elementos JSX declarativos (`<tag>`). ✔ conversão completa.

## 3. Paridade de dados (superfície Supabase)
| Camada | Bundle | Reidratado | Divergência |
|---|---|---|---|
| **RPCs** | 22 | 22 | **0** — 100% cobertura (incl. `accept_conversation`, `mark_conversation_read`, `transfer_conversation`, `update_client_contact`) |
| **Tabelas** | 40 | 41 | **1 extra** no reidratado: `whatsapp_messages` |
| **Falsos positivos** | `foo` | `foo` | `Buffer.from("foo")` da lib **xlsx** (regex `.from(`) — **descartar**, não é Supabase |

### Nota sobre `whatsapp_messages` (tabela extra legítima)
- **Origem confirmada:** é léxico do **PAR** — `REPOSITORIOENGENHARIAREVERSACODIGOFONTE/src/hooks/use-whatsapp.ts` (TSX original) também usa `(supabase as any).from('whatsapp_messages')`.
- **Segue vivo na produção:** o bundle `use-whatsapp-C823NAz3.js` emite `queryKey:['whatsapp-messages', remoteJid]` e delega o `.from()` ao helper de query (`query-CRvZdLnI.js`) — a string não aparece inline por tree-shaking. **Não é lacuna.**

## 4. Lacunas reais detectadas
- **Nenhuma** na camada de dados (RPCs/tabelas) e **nenhuma** na conversão JSX.
- O reidratado **superset** do bundle (209 vs 73) — arquivos adicionais = refactors legítimos do PAR (componentização em `components/`, `ui/`, variantes `*.tsx` sem hash p/ páginas já reestruturadas no RE).

## 5. Verdict
> **Paridade confirmada**: o reidratado (Fase 3-C) cobre 100% dos chunks, RPCs e tabelas de produção, sem lacuna de dados. Pronto para a etapa seguinte (build → dist → valida link em teste → ativar), que permanece sob decisão do Comandante quanto ao fluxo (Jhon Wick vs produção QUBITS).