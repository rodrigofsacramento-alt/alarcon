/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/label-Cqjsep1E.js | AST | sanitizado | Fase 3 ==*/
import { j as o } from "@/components/query";
import { r as s } from "@/components/vendor-Jm1Lk";
import { f as c, c as p, J as b } from "@/components/index-C9";
var v = ["a", "button", "div", "form", "h2", "h3", "img", "input", "label", "li", "nav", "ol", "p", "select", "span", "svg", "ul"],
  w = v.reduce((a, t) => {
    const e = c(`Primitive.${t}`),
      i = s.forwardRef((r, d) => {
        const {
            asChild: m,
            ...f
          } = r,
          u = m ? e : t;
        return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), <u ref={d} />;
      });
    return i.displayName = `Primitive.${t}`, {
      ...a,
      [t]: i
    };
  }, {}),
  x = "Label",
  l = s.forwardRef((a, t) => <w.label ref={t} onMouseDown={e => {
    var r;
    e.target.closest("button, input, select, textarea") || ((r = a.onMouseDown) == null || r.call(a, e), !e.defaultPrevented && e.detail > 1 && e.preventDefault());
  }} />);
l.displayName = x;
var n = l;
const N = b("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),
  y = s.forwardRef(({
    className: a,
    ...t
  }, e) => <n ref={e} className={p(N(), a)} />);
y.displayName = n.displayName;
export { y as L };