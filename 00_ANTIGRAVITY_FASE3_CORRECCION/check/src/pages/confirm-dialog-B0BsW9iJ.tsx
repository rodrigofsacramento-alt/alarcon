/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/confirm-dialog-B0BsW9iJ.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { D as d, a as x, b as h, c as j, d as f, e as g } from "@/components/ui/dialog";
import { B as r } from "@/components/index-C9";
import { v as b, L as p } from "@/components/ui";
function w({
  open: l,
  onOpenChange: t,
  title: i = "Confirmar ação",
  description: o = "Tem certeza que deseja prosseguir?",
  confirmLabel: m = "Confirmar",
  cancelLabel: c = "Cancelar",
  variant: a = "destructive",
  isLoading: s = !1,
  onConfirm: n
}) {
  return <d open={l} onOpenChange={t}><x className="sm:max-w-md bg-slate-900 border-slate-700 text-white"><h className="gap-2"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0"><b className="w-5 h-5 text-rose-400" /></div><div><j className="text-base font-semibold text-white">{i}</j><f className="text-sm text-slate-400 mt-1">{o}</f></div></div></h><g className="gap-2 sm:gap-2 mt-4"><r type="button" variant="outline" onClick={() => t(!1)} disabled={s} className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">{c}</r><r type="button" variant={a} onClick={n} disabled={s} className={a === "destructive" ? "bg-rose-600 hover:bg-rose-700 text-white" : void 0}>{s && <p className="w-4 h-4 mr-2 animate-spin" />}{m}</r></g></x></d>;
}
export { w as C };