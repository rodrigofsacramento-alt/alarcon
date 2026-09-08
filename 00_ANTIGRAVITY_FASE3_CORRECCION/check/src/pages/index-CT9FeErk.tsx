/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/index-CT9FeErk.js | AST | sanitizado | Fase 3 ==*/
import { r as s } from "@/components/vendor-Jm1Lk";
import { e as $, E as B, D as y, M as H, P as m, x as D, y as Z, a0 as q, w as E, N as K } from "@/components/index-C9";
import { u as R, h as U, R as Y, a as z, F as J } from "@/components/index";
import { j as i } from "@/components/query";
function Q(e) {
  const o = X(e),
    a = s.forwardRef((n, t) => {
      const {
          children: r,
          ...l
        } = n,
        c = s.Children.toArray(r),
        u = c.find(te);
      if (u) {
        const d = u.props.children,
          p = c.map(v => v === u ? s.Children.count(d) > 1 ? s.Children.only(null) : s.isValidElement(d) ? d.props.children : null : v);
        return <o ref={t}>{s.isValidElement(d) ? s.cloneElement(d, void 0, p) : null}</o>;
      }
      return <o ref={t}>{r}</o>;
    });
  return a.displayName = `${e}.Slot`, a;
}
function X(e) {
  const o = s.forwardRef((a, n) => {
    const {
      children: t,
      ...r
    } = a;
    if (s.isValidElement(t)) {
      const l = ne(t),
        c = oe(r, t.props);
      return t.type !== s.Fragment && (c.ref = n ? $(n, l) : l), s.cloneElement(t, c);
    }
    return s.Children.count(t) > 1 ? s.Children.only(null) : null;
  });
  return o.displayName = `${e}.SlotClone`, o;
}
var ee = Symbol("radix.slottable");
function te(e) {
  return s.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === ee;
}
function oe(e, o) {
  const a = {
    ...o
  };
  for (const n in o) {
    const t = e[n],
      r = o[n];
    /^on[A-Z]/.test(n) ? t && r ? a[n] = (...c) => {
      const u = r(...c);
      return t(...c), u;
    } : t && (a[n] = t) : n === "style" ? a[n] = {
      ...t,
      ...r
    } : n === "className" && (a[n] = [t, r].filter(Boolean).join(" "));
  }
  return {
    ...e,
    ...a
  };
}
function ne(e) {
  var n, t;
  let o = (n = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : n.get,
    a = o && "isReactWarning" in o && o.isReactWarning;
  return a ? e.ref : (o = (t = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : t.get, a = o && "isReactWarning" in o && o.isReactWarning, a ? e.props.ref : e.props.ref || e.ref);
}
var x = "Dialog",
  [N, ve] = Z(x),
  [re, f] = N(x),
  O = e => {
    const {
        __scopeDialog: o,
        children: a,
        open: n,
        defaultOpen: t,
        onOpenChange: r,
        modal: l = !0
      } = e,
      c = s.useRef(null),
      u = s.useRef(null),
      [d, p] = B({
        prop: n,
        defaultProp: t ?? !1,
        onChange: r,
        caller: x
      });
    return <re scope={o} triggerRef={c} contentRef={u} contentId={R()} titleId={R()} descriptionId={R()} open={d} onOpenChange={p} onOpenToggle={s.useCallback(() => p(v => !v), [p])} modal={l}>{a}</re>;
  };
O.displayName = x;
var I = "DialogTrigger",
  b = s.forwardRef((e, o) => {
    const {
        __scopeDialog: a,
        ...n
      } = e,
      t = f(I, a),
      r = E(o, t.triggerRef);
    return <m.button type="button" aria-haspopup="dialog" aria-expanded={t.open} aria-controls={t.contentId} data-state={P(t.open)} ref={r} onClick={D(e.onClick, t.onOpenToggle)} />;
  });
b.displayName = I;
var h = "DialogPortal",
  [ae, j] = N(h, {
    forceMount: void 0
  }),
  A = e => {
    const {
        __scopeDialog: o,
        forceMount: a,
        children: n,
        container: t
      } = e,
      r = f(h, o);
    return <ae scope={o} forceMount={a}>{s.Children.map(n, l => <y present={a || r.open}><H asChild={!0} container={t}>{l}</H></y>)}</ae>;
  };
A.displayName = h;
var C = "DialogOverlay",
  T = s.forwardRef((e, o) => {
    const a = j(C, e.__scopeDialog),
      {
        forceMount: n = a.forceMount,
        ...t
      } = e,
      r = f(C, e.__scopeDialog);
    return r.modal ? <y present={n || r.open}><ie ref={o} /></y> : null;
  });
T.displayName = C;
var se = Q("DialogOverlay.RemoveScroll"),
  ie = s.forwardRef((e, o) => {
    const {
        __scopeDialog: a,
        ...n
      } = e,
      t = f(C, a);
    return <Y as={se} allowPinchZoom={!0} shards={[t.contentRef]}><m.div data-state={P(t.open)} ref={o} style={{
        pointerEvents: "auto",
        ...n.style
      }} /></Y>;
  }),
  g = "DialogContent",
  S = s.forwardRef((e, o) => {
    const a = j(g, e.__scopeDialog),
      {
        forceMount: n = a.forceMount,
        ...t
      } = e,
      r = f(g, e.__scopeDialog);
    return <y present={n || r.open}>{r.modal ? <le ref={o} /> : <ce ref={o} />}</y>;
  });
S.displayName = g;
var le = s.forwardRef((e, o) => {
    const a = f(g, e.__scopeDialog),
      n = s.useRef(null),
      t = E(o, a.contentRef, n);
    return s.useEffect(() => {
      const r = n.current;
      if (r) return U(r);
    }, []), <M ref={t} trapFocus={a.open} disableOutsidePointerEvents={!0} onCloseAutoFocus={D(e.onCloseAutoFocus, r => {
      var l;
      r.preventDefault(), (l = a.triggerRef.current) == null || l.focus();
    })} onPointerDownOutside={D(e.onPointerDownOutside, r => {
      const l = r.detail.originalEvent,
        c = l.button === 0 && l.ctrlKey === !0;
      (l.button === 2 || c) && r.preventDefault();
    })} onFocusOutside={D(e.onFocusOutside, r => r.preventDefault())} />;
  }),
  ce = s.forwardRef((e, o) => {
    const a = f(g, e.__scopeDialog),
      n = s.useRef(!1),
      t = s.useRef(!1);
    return <M ref={o} trapFocus={!1} disableOutsidePointerEvents={!1} onCloseAutoFocus={r => {
      var l, c;
      (l = e.onCloseAutoFocus) == null || l.call(e, r), r.defaultPrevented || (n.current || (c = a.triggerRef.current) == null || c.focus(), r.preventDefault()), n.current = !1, t.current = !1;
    }} onInteractOutside={r => {
      var u, d;
      (u = e.onInteractOutside) == null || u.call(e, r), r.defaultPrevented || (n.current = !0, r.detail.originalEvent.type === "pointerdown" && (t.current = !0));
      const l = r.target;
      ((d = a.triggerRef.current) == null ? void 0 : d.contains(l)) && r.preventDefault(), r.detail.originalEvent.type === "focusin" && t.current && r.preventDefault();
    }} />;
  }),
  M = s.forwardRef((e, o) => {
    const {
        __scopeDialog: a,
        trapFocus: n,
        onOpenAutoFocus: t,
        onCloseAutoFocus: r,
        ...l
      } = e,
      c = f(g, a),
      u = s.useRef(null),
      d = E(o, u);
    return z(), <i.Fragment><J asChild={!0} loop={!0} trapped={n} onMountAutoFocus={t} onUnmountAutoFocus={r}><K role="dialog" id={c.contentId} aria-describedby={c.descriptionId} aria-labelledby={c.titleId} data-state={P(c.open)} ref={d} onDismiss={() => c.onOpenChange(!1)} /></J><i.Fragment><ue titleId={c.titleId} /><fe contentRef={u} descriptionId={c.descriptionId} /></i.Fragment></i.Fragment>;
  }),
  _ = "DialogTitle",
  w = s.forwardRef((e, o) => {
    const {
        __scopeDialog: a,
        ...n
      } = e,
      t = f(_, a);
    return <m.h2 id={t.titleId} ref={o} />;
  });
w.displayName = _;
var F = "DialogDescription",
  W = s.forwardRef((e, o) => {
    const {
        __scopeDialog: a,
        ...n
      } = e,
      t = f(F, a);
    return <m.p id={t.descriptionId} ref={o} />;
  });
W.displayName = F;
var L = "DialogClose",
  k = s.forwardRef((e, o) => {
    const {
        __scopeDialog: a,
        ...n
      } = e,
      t = f(L, a);
    return <m.button type="button" ref={o} onClick={D(e.onClick, () => t.onOpenChange(!1))} />;
  });
k.displayName = L;
function P(e) {
  return e ? "open" : "closed";
}
var G = "DialogTitleWarning",
  [Ce, V] = q(G, {
    contentName: g,
    titleName: _,
    docsSlug: "dialog"
  }),
  ue = ({
    titleId: e
  }) => {
    const o = V(G),
      a = `\`${o.contentName}\` requires a \`${o.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${o.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${o.docsSlug}`;
    return s.useEffect(() => {
      e && (document.getElementById(e) || console.error(a));
    }, [a, e]), null;
  },
  de = "DialogDescriptionWarning",
  fe = ({
    contentRef: e,
    descriptionId: o
  }) => {
    const n = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${V(de).contentName}}.`;
    return s.useEffect(() => {
      var r;
      const t = (r = e.current) == null ? void 0 : r.getAttribute("aria-describedby");
      o && t && (document.getElementById(o) || console.warn(n));
    }, [n, e, o]), null;
  },
  xe = O,
  Re = b,
  ye = A,
  Ee = T,
  he = S,
  _e = w,
  Pe = W,
  Ne = k;
export { he as C, Pe as D, Ee as O, ye as P, xe as R, _e as T, Ce as W, Ne as a, Re as b, ve as c };