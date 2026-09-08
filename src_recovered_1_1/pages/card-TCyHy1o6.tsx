/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/card-TCyHy1o6.js | AST | sanitizado | Fase 3 ==*/
import { j as s } from "@/components/query";
import { r as d } from "@/components/vendor-Jm1Lk";
import { c as t } from "@/components/index-C9";
const o = d.forwardRef(({
  className: a,
  ...e
}, r) => <div ref={r} className={t("rounded-lg border bg-card text-card-foreground shadow-sm", a)} />);
o.displayName = "Card";
const i = d.forwardRef(({
  className: a,
  ...e
}, r) => <div ref={r} className={t("flex flex-col space-y-1.5 p-6", a)} />);
i.displayName = "CardHeader";
const c = d.forwardRef(({
  className: a,
  ...e
}, r) => <h3 ref={r} className={t("text-2xl font-semibold leading-none tracking-tight", a)} />);
c.displayName = "CardTitle";
const m = d.forwardRef(({
  className: a,
  ...e
}, r) => <p ref={r} className={t("text-sm text-muted-foreground", a)} />);
m.displayName = "CardDescription";
const n = d.forwardRef(({
  className: a,
  ...e
}, r) => <div ref={r} className={t("p-6 pt-0", a)} />);
n.displayName = "CardContent";
const l = d.forwardRef(({
  className: a,
  ...e
}, r) => <div ref={r} className={t("flex items-center p-6 pt-0", a)} />);
l.displayName = "CardFooter";
export { o as C, i as a, c as b, m as c, n as d, l as e };