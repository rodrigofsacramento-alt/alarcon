/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/dialog-CGKRC-Dg.js | AST | sanitizado | Fase 3 ==*/
import { j as t } from "@/components/query";
import { r as l } from "@/components/vendor-Jm1Lk";
import { R as f, P as p, C as i, a as g, T as d, D as n, O as r } from "@/components/index";
import { c as o } from "@/components/index-C9";
import { X as x } from "@/components/ui";
const k = f,
  u = p,
  c = l.forwardRef(({
    className: a,
    ...e
  }, s) => <r ref={s} className={o("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", a)} />);
c.displayName = r.displayName;
const y = l.forwardRef(({
  className: a,
  children: e,
  ...s
}, m) => <u><c /><i ref={m} className={o("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", a)}>{e}<g className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"><x className="h-4 w-4" /><span className="sr-only">Close</span></g></i></u>);
y.displayName = i.displayName;
const N = ({
  className: a,
  ...e
}) => <div className={o("flex flex-col space-y-1.5 text-center sm:text-left", a)} />;
N.displayName = "DialogHeader";
const j = ({
  className: a,
  ...e
}) => <div className={o("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", a)} />;
j.displayName = "DialogFooter";
const D = l.forwardRef(({
  className: a,
  ...e
}, s) => <d ref={s} className={o("text-lg font-semibold leading-none tracking-tight", a)} />);
D.displayName = d.displayName;
const b = l.forwardRef(({
  className: a,
  ...e
}, s) => <n ref={s} className={o("text-sm text-muted-foreground", a)} />);
b.displayName = n.displayName;
export { k as D, y as a, N as b, D as c, b as d, j as e };