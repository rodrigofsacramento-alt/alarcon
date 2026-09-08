/*== ANTIGRAVITY RECOVERED v2.2-CORRIGIDO — origem: 1.1/assets/Atendimento-live-v14.js | AST post-order | sanitizado | Fase 3 ==*/
import { j as e, u as Nn } from "@/components/query";
import { r as i, R as wn, u as yn, g as _n, f as Cn } from "@/components/vendor-Jm1Lk";
import { P as Ie, e as yt, c as q, B as m, I as Ot, u as Ba, s as B, S as Ht, a as ne, f as kn, A as _e, g as Ce, d as ke, h as Sn, i as An, j as En, k as In, l as Pn, m as $n, n as Rn, o as zn, p as qn, q as Dn, r as Tn, t as C, v as ja } from "@/components/index-C9";
import { L as ye } from "@/components/label";
import { T as Mn } from "@/components/ui/textarea";
import { D as Ln, a as On, b as Wn, c as Vn } from "@/components/ui/dialog";
import { S as Na, a as wa, b as ya, c as _a, d as re } from "@/components/ui/select";
import { R as Fn, P as Qn, O as Bn, C as Gn } from "@/components/index";
import { u as st } from "@/components/index";
import { S as Ma, o as he, G as Ze, $ as Un, a0 as ur, J as xr, F as rt, u as Ga, a1 as Nt, L as fe, a2 as wt, a3 as La, P as Oe, a4 as _t, r as Jt, X as xe, a5 as pr, a6 as hr, v as Ua, a7 as fr, a8 as Oa, l as Kn, a9 as Wa, U as Le, e as Bt, aa as Ca, N as Hn, z as Wt, ab as Jn, ac as ar, ad as Xn, O as Yn, ae as sr, A as Zn, W as ka, af as ei, Q as ti, ag as ai, ah as Sa, ai as si, m as bt, aj as rr, ak as ri, al as ni, C as Aa, y as ii, am as oi, n as Ea, an as li, ao as ci, p as Ia, _ as di } from "@/components/ui";
import { P as Gt, a as Ut, b as Kt, c as mi, d as ui, e as xi, f as pi, g as hi, S as fi, M as gi, H as bi } from "@/components/Header";
import { u as vi, c as ji } from "@/hooks/useLeads";
import { I as Ni } from "@/components/ImportLeadsModal";
import { u as wi } from "@/hooks/useVisits";
import { u as yi } from "@/hooks/useAgents";
import { u as Ka, a as gr, b as br, c as vr, d as _i } from "@/hooks/useWhatsapp";
import { B as U } from "@/components/ui/badge";
import { C as Ci, a as ki, b as Si, c as Ai, d as Ei } from "@/components/ui/card";
import { D as He, a as Je, b as Xe, c as Pa, d as Y, e as Vt } from "@/components/ui/dropdown-menu";
import "@/lib/supabase";
import "@/components/logo-estate";
import "@/components/xlsx";
function AudioFailSafeModal() {
  const [incident, setIncident] = i.useState(null);
  i.useEffect(() => {
    const handler = async ev => {
      const d = ev.detail || {
        active: true
      };
      setIncident(d);
      try {
        const md = {};
        if (d.audioUrl) md.audioUrl = d.audioUrl;
        if (d.content) md.content = d.content;
        const {
          error
        } = await B.from("audit_logs").insert({
          action: "AUDIO_FAIL_REPORTED",
          resource_type: "audio",
          resource_id: d.conversation_id || d.conversationId || null,
          description: (d.leadName ? d.leadName + " - " : "") + "Áudio com falha reportado pelo atendente",
          metadata: md,
          created_at: new Date().toISOString()
        });
        if (error) console.warn("[AudioFailSafe] audit insert error", error.message);
      } catch (e) {
        console.warn("[AudioFailSafe] audit insert exception", e);
      }
    };
    window.addEventListener("openAudioFailSafe", handler);
    return () => window.removeEventListener("openAudioFailSafe", handler);
  }, []);
  if (!incident) return null;
  return <div style={{
    position: "fixed",
    bottom: "80px",
    right: "24px",
    zIndex: 99999
  }}><div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl max-w-sm flex items-center gap-3 text-white"><div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 text-base font-bold">⚠️</div><div className="flex-1 min-w-0 text-left"><p className="text-xs font-bold text-white truncate">Contingência de Áudio Ativa</p><p className="text-[11px] text-slate-300 truncate">Status: Investigando & Auto-Recovery</p></div><button onClick={() => setIncident(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg transition-all shrink-0 cursor-pointer"><span>✓</span> Sim, Resolvido</button></div></div>;
}
var nr = 1,
  Ii = .9,
  Pi = .8,
  $i = .17,
  $a = .1,
  Ra = .999,
  Ri = .9999,
  zi = .99,
  qi = /[\\\/_+.#"@\[\(\{&]/,
  Di = /[\\\/_+.#"@\[\(\{&]/g,
  Ti = /[\s-]/,
  jr = /[\s-]/g;
function Va(s, a, l, n, d, p, h) {
  if (p === a.length) return d === s.length ? nr : zi;
  var g = `${d},${p}`;
  if (h[g] !== void 0) return h[g];
  for (var w = n.charAt(p), f = l.indexOf(w, d), S = 0, A, k, z, O; f >= 0;) A = Va(s, a, l, n, f + 1, p + 1, h), A > S && (f === d ? A *= nr : qi.test(s.charAt(f - 1)) ? (A *= Pi, z = s.slice(d, f - 1).match(Di), z && d > 0 && (A *= Math.pow(Ra, z.length))) : Ti.test(s.charAt(f - 1)) ? (A *= Ii, O = s.slice(d, f - 1).match(jr), O && d > 0 && (A *= Math.pow(Ra, O.length))) : (A *= $i, d > 0 && (A *= Math.pow(Ra, f - d))), s.charAt(f) !== a.charAt(p) && (A *= Ri)), (A < $a && l.charAt(f - 1) === n.charAt(p + 1) || n.charAt(p + 1) === n.charAt(p) && l.charAt(f - 1) !== n.charAt(p)) && (k = Va(s, a, l, n, f + 1, p + 2, h), k * $a > A && (A = k * $a)), A > S && (S = A), f = l.indexOf(w, f + 1);
  return h[g] = S, S;
}
function ir(s) {
  return s.toLowerCase().replace(jr, " ");
}
function Mi(s, a, l) {
  return s = l && l.length > 0 ? `${s + " " + l.join(" ")}` : s, Va(s, a, ir(s), ir(a), 0, 0, {});
}
var vt = '[cmdk-group=""]',
  za = '[cmdk-group-items=""]',
  Li = '[cmdk-group-heading=""]',
  Nr = '[cmdk-item=""]',
  or = `${Nr}:not([aria-disabled="true"])`,
  Fa = "cmdk-item-select",
  et = "data-value",
  Oi = (s, a, l) => Mi(s, a, l),
  wr = i.createContext(void 0),
  Ct = () => i.useContext(wr),
  yr = i.createContext(void 0),
  Ha = () => i.useContext(yr),
  _r = i.createContext(void 0),
  Cr = i.forwardRef((s, a) => {
    let l = tt(() => {
        var x, E;
        return {
          search: "",
          value: (E = (x = s.value) != null ? x : s.defaultValue) != null ? E : "",
          selectedItemId: void 0,
          filtered: {
            count: 0,
            items: new Map(),
            groups: new Set()
          }
        };
      }),
      n = tt(() => new Set()),
      d = tt(() => new Map()),
      p = tt(() => new Map()),
      h = tt(() => new Set()),
      g = kr(s),
      {
        label: w,
        children: f,
        value: S,
        onValueChange: A,
        filter: k,
        shouldFilter: z,
        loop: O,
        disablePointerSelection: W = !1,
        vimBindings: b = !0,
        ...R
      } = s,
      M = st(),
      ue = st(),
      ce = st(),
      K = i.useRef(null),
      y = Xi();
    We(() => {
      if (S !== void 0) {
        let x = S.trim();
        l.current.value = x, I.emit();
      }
    }, [S]), We(() => {
      y(6, ge);
    }, []);
    let I = i.useMemo(() => ({
        subscribe: x => (h.current.add(x), () => h.current.delete(x)),
        snapshot: () => l.current,
        setState: (x, E, P) => {
          var _, D, V, te;
          if (!Object.is(l.current[x], E)) {
            if (l.current[x] = E, x === "search") Ve(), Se(), y(1, Ae);else if (x === "value") {
              if (document.activeElement.hasAttribute("cmdk-input") || document.activeElement.hasAttribute("cmdk-root")) {
                let ee = document.getElementById(ce);
                ee ? ee.focus() : (_ = document.getElementById(M)) == null || _.focus();
              }
              if (y(7, () => {
                var ee;
                l.current.selectedItemId = (ee = be()) == null ? void 0 : ee.id, I.emit();
              }), P || y(5, ge), ((D = g.current) == null ? void 0 : D.value) !== void 0) {
                let ee = E ?? "";
                (te = (V = g.current).onValueChange) == null || te.call(V, ee);
                return;
              }
            }
            I.emit();
          }
        },
        emit: () => {
          h.current.forEach(x => x());
        }
      }), []),
      F = i.useMemo(() => ({
        value: (x, E, P) => {
          var _;
          E !== ((_ = p.current.get(x)) == null ? void 0 : _.value) && (p.current.set(x, {
            value: E,
            keywords: P
          }), l.current.filtered.items.set(x, le(E, P)), y(2, () => {
            Se(), I.emit();
          }));
        },
        item: (x, E) => (n.current.add(x), E && (d.current.has(E) ? d.current.get(E).add(x) : d.current.set(E, new Set([x]))), y(3, () => {
          Ve(), Se(), l.current.value || Ae(), I.emit();
        }), () => {
          p.current.delete(x), n.current.delete(x), l.current.filtered.items.delete(x);
          let P = be();
          y(4, () => {
            Ve(), (P == null ? void 0 : P.getAttribute("id")) === x && Ae(), I.emit();
          });
        }),
        group: x => (d.current.has(x) || d.current.set(x, new Set()), () => {
          p.current.delete(x), d.current.delete(x);
        }),
        filter: () => g.current.shouldFilter,
        label: w || s["aria-label"],
        getDisablePointerSelection: () => g.current.disablePointerSelection,
        listId: M,
        inputId: ce,
        labelId: ue,
        listInnerRef: K
      }), []);
    function le(x, E) {
      var P, _;
      let D = (_ = (P = g.current) == null ? void 0 : P.filter) != null ? _ : Oi;
      return x ? D(x, l.current.search, E) : 0;
    }
    function Se() {
      if (!l.current.search || g.current.shouldFilter === !1) return;
      let x = l.current.filtered.items,
        E = [];
      l.current.filtered.groups.forEach(_ => {
        let D = d.current.get(_),
          V = 0;
        D.forEach(te => {
          let ee = x.get(te);
          V = Math.max(ee, V);
        }), E.push([_, V]);
      });
      let P = K.current;
      Pe().sort((_, D) => {
        var V, te;
        let ee = _.getAttribute("id"),
          ve = D.getAttribute("id");
        return ((V = x.get(ve)) != null ? V : 0) - ((te = x.get(ee)) != null ? te : 0);
      }).forEach(_ => {
        let D = _.closest(za);
        D ? D.appendChild(_.parentElement === D ? _ : _.closest(`${za} > *`)) : P.appendChild(_.parentElement === P ? _ : _.closest(`${za} > *`));
      }), E.sort((_, D) => D[1] - _[1]).forEach(_ => {
        var D;
        let V = (D = K.current) == null ? void 0 : D.querySelector(`${vt}[${et}="${encodeURIComponent(_[0])}"]`);
        V == null || V.parentElement.appendChild(V);
      });
    }
    function Ae() {
      let x = Pe().find(P => P.getAttribute("aria-disabled") !== "true"),
        E = x == null ? void 0 : x.getAttribute(et);
      I.setState("value", E || void 0);
    }
    function Ve() {
      var x, E, P, _;
      if (!l.current.search || g.current.shouldFilter === !1) {
        l.current.filtered.count = n.current.size;
        return;
      }
      l.current.filtered.groups = new Set();
      let D = 0;
      for (let V of n.current) {
        let te = (E = (x = p.current.get(V)) == null ? void 0 : x.value) != null ? E : "",
          ee = (_ = (P = p.current.get(V)) == null ? void 0 : P.keywords) != null ? _ : [],
          ve = le(te, ee);
        l.current.filtered.items.set(V, ve), ve > 0 && D++;
      }
      for (let [V, te] of d.current) for (let ee of te) if (l.current.filtered.items.get(ee) > 0) {
        l.current.filtered.groups.add(V);
        break;
      }
      l.current.filtered.count = D;
    }
    function ge() {
      var x, E, P;
      let _ = be();
      _ && (((x = _.parentElement) == null ? void 0 : x.firstChild) === _ && ((P = (E = _.closest(vt)) == null ? void 0 : E.querySelector(Li)) == null || P.scrollIntoView({
        block: "nearest"
      })), _.scrollIntoView({
        block: "nearest"
      }));
    }
    function be() {
      var x;
      return (x = K.current) == null ? void 0 : x.querySelector(`${Nr}[aria-selected="true"]`);
    }
    function Pe() {
      var x;
      return Array.from(((x = K.current) == null ? void 0 : x.querySelectorAll(or)) || []);
    }
    function $e(x) {
      let E = Pe()[x];
      E && I.setState("value", E.getAttribute(et));
    }
    function nt(x) {
      var E;
      let P = be(),
        _ = Pe(),
        D = _.findIndex(te => te === P),
        V = _[D + x];
      (E = g.current) != null && E.loop && (V = D + x < 0 ? _[_.length - 1] : D + x === _.length ? _[0] : _[D + x]), V && I.setState("value", V.getAttribute(et));
    }
    function Re(x) {
      let E = be(),
        P = E == null ? void 0 : E.closest(vt),
        _;
      for (; P && !_;) P = x > 0 ? Hi(P, vt) : Ji(P, vt), _ = P == null ? void 0 : P.querySelector(or);
      _ ? I.setState("value", _.getAttribute(et)) : nt(x);
    }
    let Fe = () => $e(Pe().length - 1),
      kt = x => {
        x.preventDefault(), x.metaKey ? Fe() : x.altKey ? Re(1) : nt(1);
      },
      pe = x => {
        x.preventDefault(), x.metaKey ? $e(0) : x.altKey ? Re(-1) : nt(-1);
      };
    return i.createElement(Ie.div, {
      ref: a,
      tabIndex: -1,
      ...R,
      "cmdk-root": "",
      onKeyDown: x => {
        var E;
        (E = R.onKeyDown) == null || E.call(R, x);
        let P = x.nativeEvent.isComposing || x.keyCode === 229;
        if (!(x.defaultPrevented || P)) switch (x.key) {
          case "n":
          case "j":
            {
              b && x.ctrlKey && kt(x);
              break;
            }
          case "ArrowDown":
            {
              kt(x);
              break;
            }
          case "p":
          case "k":
            {
              b && x.ctrlKey && pe(x);
              break;
            }
          case "ArrowUp":
            {
              pe(x);
              break;
            }
          case "Home":
            {
              x.preventDefault(), $e(0);
              break;
            }
          case "End":
            {
              x.preventDefault(), Fe();
              break;
            }
          case "Enter":
            {
              x.preventDefault();
              let _ = be();
              if (_) {
                let D = new Event(Fa);
                _.dispatchEvent(D);
              }
            }
        }
      }
    }, i.createElement("label", {
      "cmdk-label": "",
      htmlFor: F.inputId,
      id: F.labelId,
      style: Zi
    }, w), Xt(s, x => i.createElement(yr.Provider, {
      value: I
    }, i.createElement(wr.Provider, {
      value: F
    }, x))));
  }),
  Wi = i.forwardRef((s, a) => {
    var l, n;
    let d = st(),
      p = i.useRef(null),
      h = i.useContext(_r),
      g = Ct(),
      w = kr(s),
      f = (n = (l = w.current) == null ? void 0 : l.forceMount) != null ? n : h == null ? void 0 : h.forceMount;
    We(() => {
      if (!f) return g.item(d, h == null ? void 0 : h.id);
    }, [f]);
    let S = Sr(d, p, [s.value, s.children, p], s.keywords),
      A = Ha(),
      k = Ee(y => y.value && y.value === S.current),
      z = Ee(y => f || g.filter() === !1 ? !0 : y.search ? y.filtered.items.get(d) > 0 : !0);
    i.useEffect(() => {
      let y = p.current;
      if (!(!y || s.disabled)) return y.addEventListener(Fa, O), () => y.removeEventListener(Fa, O);
    }, [z, s.onSelect, s.disabled]);
    function O() {
      var y, I;
      W(), (I = (y = w.current).onSelect) == null || I.call(y, S.current);
    }
    function W() {
      A.setState("value", S.current, !0);
    }
    if (!z) return null;
    let {
      disabled: b,
      value: R,
      onSelect: M,
      forceMount: ue,
      keywords: ce,
      ...K
    } = s;
    return i.createElement(Ie.div, {
      ref: yt(p, a),
      ...K,
      id: d,
      "cmdk-item": "",
      role: "option",
      "aria-disabled": !!b,
      "aria-selected": !!k,
      "data-disabled": !!b,
      "data-selected": !!k,
      onPointerMove: b || g.getDisablePointerSelection() ? void 0 : W,
      onClick: b ? void 0 : O
    }, s.children);
  }),
  Vi = i.forwardRef((s, a) => {
    let {
        heading: l,
        children: n,
        forceMount: d,
        ...p
      } = s,
      h = st(),
      g = i.useRef(null),
      w = i.useRef(null),
      f = st(),
      S = Ct(),
      A = Ee(z => d || S.filter() === !1 ? !0 : z.search ? z.filtered.groups.has(h) : !0);
    We(() => S.group(h), []), Sr(h, g, [s.value, s.heading, w]);
    let k = i.useMemo(() => ({
      id: h,
      forceMount: d
    }), [d]);
    return i.createElement(Ie.div, {
      ref: yt(g, a),
      ...p,
      "cmdk-group": "",
      role: "presentation",
      hidden: A ? void 0 : !0
    }, l && i.createElement("div", {
      ref: w,
      "cmdk-group-heading": "",
      "aria-hidden": !0,
      id: f
    }, l), Xt(s, z => i.createElement("div", {
      "cmdk-group-items": "",
      role: "group",
      "aria-labelledby": l ? f : void 0
    }, i.createElement(_r.Provider, {
      value: k
    }, z))));
  }),
  Fi = i.forwardRef((s, a) => {
    let {
        alwaysRender: l,
        ...n
      } = s,
      d = i.useRef(null),
      p = Ee(h => !h.search);
    return !l && !p ? null : i.createElement(Ie.div, {
      ref: yt(d, a),
      ...n,
      "cmdk-separator": "",
      role: "separator"
    });
  }),
  Qi = i.forwardRef((s, a) => {
    let {
        onValueChange: l,
        ...n
      } = s,
      d = s.value != null,
      p = Ha(),
      h = Ee(f => f.search),
      g = Ee(f => f.selectedItemId),
      w = Ct();
    return i.useEffect(() => {
      s.value != null && p.setState("search", s.value);
    }, [s.value]), i.createElement(Ie.input, {
      ref: a,
      ...n,
      "cmdk-input": "",
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: !1,
      "aria-autocomplete": "list",
      role: "combobox",
      "aria-expanded": !0,
      "aria-controls": w.listId,
      "aria-labelledby": w.labelId,
      "aria-activedescendant": g,
      id: w.inputId,
      type: "text",
      value: d ? s.value : h,
      onChange: f => {
        d || p.setState("search", f.target.value), l == null || l(f.target.value);
      }
    });
  }),
  Bi = i.forwardRef((s, a) => {
    let {
        children: l,
        label: n = "Suggestions",
        ...d
      } = s,
      p = i.useRef(null),
      h = i.useRef(null),
      g = Ee(f => f.selectedItemId),
      w = Ct();
    return i.useEffect(() => {
      if (h.current && p.current) {
        let f = h.current,
          S = p.current,
          A,
          k = new ResizeObserver(() => {
            A = requestAnimationFrame(() => {
              let z = f.offsetHeight;
              S.style.setProperty("--cmdk-list-height", z.toFixed(1) + "px");
            });
          });
        return k.observe(f), () => {
          cancelAnimationFrame(A), k.unobserve(f);
        };
      }
    }, []), i.createElement(Ie.div, {
      ref: yt(p, a),
      ...d,
      "cmdk-list": "",
      role: "listbox",
      tabIndex: -1,
      "aria-activedescendant": g,
      "aria-label": n,
      id: w.listId
    }, Xt(s, f => i.createElement("div", {
      ref: yt(h, w.listInnerRef),
      "cmdk-list-sizer": ""
    }, f)));
  }),
  Gi = i.forwardRef((s, a) => {
    let {
      open: l,
      onOpenChange: n,
      overlayClassName: d,
      contentClassName: p,
      container: h,
      ...g
    } = s;
    return i.createElement(Fn, {
      open: l,
      onOpenChange: n
    }, i.createElement(Qn, {
      container: h
    }, i.createElement(Bn, {
      "cmdk-overlay": "",
      className: d
    }), i.createElement(Gn, {
      "aria-label": s.label,
      "cmdk-dialog": "",
      className: p
    }, i.createElement(Cr, {
      ref: a,
      ...g
    }))));
  }),
  Ui = i.forwardRef((s, a) => Ee(l => l.filtered.count === 0) ? i.createElement(Ie.div, {
    ref: a,
    ...s,
    "cmdk-empty": "",
    role: "presentation"
  }) : null),
  Ki = i.forwardRef((s, a) => {
    let {
      progress: l,
      children: n,
      label: d = "Loading...",
      ...p
    } = s;
    return i.createElement(Ie.div, {
      ref: a,
      ...p,
      "cmdk-loading": "",
      role: "progressbar",
      "aria-valuenow": l,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-label": d
    }, Xt(s, h => i.createElement("div", {
      "aria-hidden": !0
    }, h)));
  }),
  oe = Object.assign(Cr, {
    List: Bi,
    Item: Wi,
    Input: Qi,
    Group: Vi,
    Separator: Fi,
    Dialog: Gi,
    Empty: Ui,
    Loading: Ki
  });
function Hi(s, a) {
  let l = s.nextElementSibling;
  for (; l;) {
    if (l.matches(a)) return l;
    l = l.nextElementSibling;
  }
}
function Ji(s, a) {
  let l = s.previousElementSibling;
  for (; l;) {
    if (l.matches(a)) return l;
    l = l.previousElementSibling;
  }
}
function kr(s) {
  let a = i.useRef(s);
  return We(() => {
    a.current = s;
  }), a;
}
var We = typeof window > "u" ? i.useEffect : i.useLayoutEffect;
function tt(s) {
  let a = i.useRef();
  return a.current === void 0 && (a.current = s()), a;
}
function Ee(s) {
  let a = Ha(),
    l = () => s(a.snapshot());
  return i.useSyncExternalStore(a.subscribe, l, l);
}
function Sr(s, a, l, n = []) {
  let d = i.useRef(),
    p = Ct();
  return We(() => {
    var h;
    let g = (() => {
        var f;
        for (let S of l) {
          if (typeof S == "string") return S.trim();
          if (typeof S == "object" && "current" in S) return S.current ? (f = S.current.textContent) == null ? void 0 : f.trim() : d.current;
        }
      })(),
      w = n.map(f => f.trim());
    p.value(s, g, w), (h = a.current) == null || h.setAttribute(et, g), d.current = g;
  }), d;
}
var Xi = () => {
  let [s, a] = i.useState(),
    l = tt(() => new Map());
  return We(() => {
    l.current.forEach(n => n()), l.current = new Map();
  }, [s]), (n, d) => {
    l.current.set(n, d), a({});
  };
};
function Yi(s) {
  let a = s.type;
  return typeof a == "function" ? a(s.props) : "render" in a ? a.render(s.props) : s;
}
function Xt({
  asChild: s,
  children: a
}, l) {
  return s && i.isValidElement(a) ? i.cloneElement(Yi(a), {
    ref: a.ref
  }, l(a.props.children)) : l(a);
}
var Zi = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0"
};
const Ar = i.forwardRef(({
  className: s,
  ...a
}, l) => <oe ref={l} className={q("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", s)} />);
Ar.displayName = oe.displayName;
const Er = i.forwardRef(({
  className: s,
  ...a
}, l) => <div className="flex items-center border-b px-3" cmdk-input-wrapper=""><Ma className="mr-2 h-4 w-4 shrink-0 opacity-50" /><oe.Input ref={l} className={q("flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", s)} /></div>);
Er.displayName = oe.Input.displayName;
const eo = i.forwardRef(({
  className: s,
  ...a
}, l) => <oe.List ref={l} className={q("max-h-[300px] overflow-y-auto overflow-x-hidden", s)} />);
eo.displayName = oe.List.displayName;
const Ir = i.forwardRef((s, a) => <oe.Empty ref={a} className="py-6 text-center text-sm" />);
Ir.displayName = oe.Empty.displayName;
const Pr = i.forwardRef(({
  className: s,
  ...a
}, l) => <oe.Group ref={l} className={q("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", s)} />);
Pr.displayName = oe.Group.displayName;
const to = i.forwardRef(({
  className: s,
  ...a
}, l) => <oe.Separator ref={l} className={q("-mx-1 h-px bg-border", s)} />);
to.displayName = oe.Separator.displayName;
const $r = i.forwardRef(({
  className: s,
  ...a
}, l) => <oe.Item ref={l} className={q("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50", s)} />);
$r.displayName = oe.Item.displayName;
const lr = {
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  lead_id: "",
  channel: "whatsapp",
  type: "Venda",
  priority: "normal",
  subject: "",
  description: ""
};
function ao({
  open: s,
  onOpenChange: a,
  onConfirm: l,
  defaultLeadId: n
}) {
  var W;
  const [d, p] = i.useState(lr),
    [h, g] = i.useState(1),
    [w, f] = i.useState(!1),
    {
      data: S = []
    } = vi({});
  i.useEffect(() => {
    s ? n && p(b => ({
      ...b,
      lead_id: n
    })) : (p(lr), g(1));
  }, [s, n]), i.useEffect(() => {
    if (d.lead_id) {
      const b = S.find(R => R.id === d.lead_id);
      b && p(R => ({
        ...R,
        contact_name: R.contact_name || b.name || "",
        contact_phone: R.contact_phone || b.phone || "",
        contact_email: R.contact_email || b.email || ""
      }));
    }
  }, [d.lead_id, S]);
  const A = (b, R) => {
      p(M => ({
        ...M,
        [b]: R
      }));
    },
    k = () => {
      l(d), a(!1);
    },
    z = typeof d.contact_name == "string" && d.contact_name.trim().length > 0,
    O = 2;
  return <Ln open={s} onOpenChange={a}><On className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"><div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5"><Wn><Vn className="text-xl font-semibold flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><he className="h-5 w-5 text-accent" /></div><div><span>Novo Atendimento</span><p className="text-sm font-normal text-muted-foreground mt-0.5">Etapa {h} de {O}</p></div></Vn></Wn><div className="flex gap-2 mt-4">{Array.from({
            length: O
          }).map((b, R) => <div className={`flex-1 h-1.5 rounded-full transition-colors ${R < h ? "bg-accent" : "bg-muted"}`} />)}</div></div><div className="px-6 py-5 space-y-6">{h === 1 && <e.Fragment><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Ze className="h-4 w-4 text-accent" /><span>Dados do Contato</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="space-y-2"><ye>Vincular a Lead Existente</ye><Gt open={w} onOpenChange={f}><Ut asChild={!0}><m variant="outline" role="combobox" aria-expanded={w} className="w-full justify-between font-normal">{d.lead_id ? (() => {
                        const b = S.find(R => R.id === d.lead_id);
                        return b ? `${b.name} ${b.phone ? `— ${b.phone}` : ""}` : "Selecione um lead (opcional)";
                      })() : "Selecione um lead (opcional)"}<Un className="ml-2 h-4 w-4 shrink-0 opacity-50" /></m></Ut><Kt className="w-full min-w-[300px] p-0" align="start"><Ar><Er placeholder="Buscar leads pelo nome, email ou telefone..." /><Ir>Nenhum lead encontrado.</Ir><Pr className="max-h-64 overflow-y-auto">{S.map(b => <$r value={`${b.name} ${b.phone || ""} ${b.email || ""}`} onSelect={() => {
                          A("lead_id", b.id === d.lead_id ? "" : b.id), f(!1);
                        }}><ur className={q("mr-2 h-4 w-4", d.lead_id === b.id ? "opacity-100" : "opacity-0")} /><div className="flex flex-col"><span>{b.name}</span>{(b.phone || b.email) && <span className="text-xs text-muted-foreground">{b.phone ? ` ${b.phone}` : ""} {b.email ? ` | ${b.email}` : ""}</span>}</div></$r>)}</Pr></Ar></Kt></Gt></div><div className="space-y-2"><ye>Nome do Contato *</ye><Ot placeholder="Ex: Ricardo Ferreira" value={d.contact_name} onChange={b => A("contact_name", b.target.value)} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><ye>Telefone</ye><Ot placeholder="Ex: 11999998888" value={d.contact_phone} onChange={b => A("contact_phone", b.target.value)} /></div><div className="space-y-2"><ye>Email</ye><Ot placeholder="Ex: contato@email.com" value={d.contact_email} onChange={b => A("contact_email", b.target.value)} /></div></div></div></div><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><xr className="h-4 w-4 text-accent" /><span>Canal e Tipo</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><ye>Canal</ye><Na value={d.channel} onValueChange={b => A("channel", b)}><wa><ya /></wa><_a><re value="whatsapp">WhatsApp</re><re value="grupo_whatsapp">Grupo WhatsApp</re><re value="telefone">Telefone</re><re value="email">Email</re><re value="presencial">Presencial</re><re value="site">Site</re><re value="instagram">Instagram</re></_a></Na></div><div className="space-y-2"><ye>Tipo</ye><Na value={d.type} onValueChange={b => A("type", b)}><wa><ya /></wa><_a><re value="Venda">Venda</re><re value="Aluguel">Aluguel</re><re value="Consultoria">Consultoria</re><re value="Suporte">Suporte</re></_a></Na></div><div className="space-y-2"><ye>Prioridade</ye><Na value={d.priority} onValueChange={b => A("priority", b)}><wa><ya /></wa><_a><re value="baixa">Baixa</re><re value="normal">Normal</re><re value="alta">Alta</re><re value="urgente">Urgente</re></_a></Na></div></div></div></div></e.Fragment>}{h === 2 && <e.Fragment><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><rt className="h-4 w-4 text-accent" /><span>Detalhes do Atendimento</span></div><div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50"><div className="space-y-2"><ye>Assunto *</ye><Ot placeholder="Ex: Interesse no Edifício Horizon - Cobertura" value={d.subject} onChange={b => A("subject", b.target.value)} /></div><div className="space-y-2"><ye>Descrição / Primeira Mensagem</ye><Mn placeholder="Descreva o motivo do atendimento ou a primeira mensagem do contato..." value={d.description} onChange={b => A("description", b.target.value)} rows={4} /></div></div></div><div className="space-y-4"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Ga className="h-4 w-4 text-accent" /><span>Resumo</span></div><div className="bg-muted/30 rounded-xl p-4 border border-border/50"><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-muted-foreground">Contato</p><p className="font-medium text-foreground">{d.contact_name || "—"}</p></div><div><p className="text-xs text-muted-foreground">Telefone</p><p className="font-medium text-foreground">{d.contact_phone || "—"}</p></div><div><p className="text-xs text-muted-foreground">Canal</p><p className="font-medium text-foreground capitalize">{d.channel}</p></div><div><p className="text-xs text-muted-foreground">Tipo</p><p className="font-medium text-foreground">{d.type}</p></div><div><p className="text-xs text-muted-foreground">Prioridade</p><p className="font-medium text-foreground capitalize">{d.priority}</p></div>{d.lead_id && <div><p className="text-xs text-muted-foreground">Lead</p><p className="font-medium text-foreground">{((W = S.find(b => b.id === d.lead_id)) == null ? void 0 : W.name) || "—"}</p></div>}</div></div></div></e.Fragment>}</div><div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between gap-3"><div>{h > 1 && <m variant="outline" onClick={() => g(h - 1)}>Voltar</m>}</div><div className="flex gap-3"><m variant="outline" onClick={() => a(!1)}>Cancelar</m>{h < O ? <m variant="cta" onClick={() => g(h + 1)} disabled={!z}>Próximo</m> : <m variant="cta" onClick={k} disabled={!z}>Criar Atendimento</m>}</div></div></On></Ln>;
}
function so() {
  const {
      profile: s
    } = Ba(),
    {
      data: a,
      isLoading: l,
      refetch: n
    } = Ka(),
    d = gr(),
    p = br(),
    h = vr(),
    [g, w] = i.useState(null),
    [f, S] = i.useState(""),
    A = (a == null ? void 0 : a.ai_enabled) !== !1,
    k = a != null && a.qr_expires_at ? new Date(a.qr_expires_at) : null,
    z = !!k && k.getTime() <= Date.now(),
    [O, W] = i.useState(!1);
  i.useEffect(() => {
    if (!(s != null && s.tenant_id)) return;
    const y = B.channel("whatsapp-session-realtime").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "whatsapp_sessions",
      filter: `tenant_id=eq.${s.tenant_id}`
    }, () => {
      n();
    }).subscribe();
    return () => {
      y.unsubscribe();
    };
  }, [s == null ? void 0 : s.tenant_id, n]), i.useEffect(() => {
    let y;
    return ((a == null ? void 0 : a.status) === "connecting" || (a == null ? void 0 : a.status) === "qr_ready") && (y = setInterval(() => {
      n();
    }, 3e3)), () => {
      y && clearInterval(y);
    };
  }, [a == null ? void 0 : a.status, n]), i.useEffect(() => {
    (a == null ? void 0 : a.status) === "connecting" ? g || w(Date.now()) : w(null);
  }, [a == null ? void 0 : a.status, g]);
  const b = () => {
      w(Date.now()), W(!0);
      const y = f.replace(/\D/g, "");
      d.mutate(y ? {
        phone_number: y
      } : void 0, {
        onSuccess: () => ne.info("Sessão iniciada. Escaneie o QR Code quando aparecer."),
        onError: I => ne.error((I == null ? void 0 : I.message) || "Erro ao iniciar sessão")
      });
    },
    R = () => {
      W(!0);
    },
    M = () => {
      W(!1), p.mutate(void 0, {
        onSuccess: () => ne.success("Sessão desconectada"),
        onError: y => ne.error((y == null ? void 0 : y.message) || "Erro ao desconectar")
      });
    },
    ue = async () => {
      const y = f.replace(/\D/g, "");
      if (y.length < 10) {
        ne.error("Informe o numero com DDI e DDD. Ex: 5555999999999");
        return;
      }
      try {
        await p.mutateAsync(), w(Date.now()), await d.mutateAsync({
          phone_number: y
        }), ne.info("Gerando codigo de pareamento. Aguarde alguns segundos.");
      } catch (I) {
        ne.error((I == null ? void 0 : I.message) || "Erro ao gerar codigo de pareamento");
      }
    },
    ce = y => {
      h.mutate({
        enabled: y
      }, {
        onSuccess: () => ne.success(y ? "IA ativada" : "IA pausada"),
        onError: I => ne.error((I == null ? void 0 : I.message) || "Erro ao atualizar IA")
      });
    },
    K = <div className="w-full rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><Nt className="h-4 w-4" /></div><div className="min-w-0"><p className="text-sm font-semibold text-foreground">Inteligencia artificial</p><p className="text-xs text-muted-foreground">{A ? "Responde automaticamente novas mensagens." : "Mensagens entram em modo manual."}</p></div></div><Ht checked={A} onCheckedChange={ce} disabled={h.isPending} aria-label="Ativar ou pausar inteligencia artificial" /></div></div>;
  if (l) return <div className="flex items-center justify-center py-20"><fe className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!a || a.status === "disconnected" || a.status === "qr_ready" && !O) {
    const y = (a == null ? void 0 : a.status) === "qr_ready";
    return <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8"><div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]"><section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"><div className="border-b border-border bg-gradient-to-r from-primary to-primary/90 p-6 text-primary-foreground"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15"><wt className="h-6 w-6" /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-semibold">WhatsApp da imobiliaria desconectado</h3><U className="border-white/20 bg-white/15 text-white hover:bg-white/15">Atencao necessaria</U></div><p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">As mensagens novas nao entram na Central de Atendimento enquanto a conta da imobiliaria estiver fora do ar. Reconecte pelo QR Code ou use pareamento por codigo quando o celular nao conseguir ler o QR.</p></div></div><m variant="secondary" className="shrink-0 gap-2 bg-white text-primary hover:bg-white/90" onClick={() => n()}><La className="h-4 w-4" />Atualizar status</m></div></div><div className="grid gap-6 p-6 lg:grid-cols-[0.95fr_1.05fr]"><div className="space-y-4"><div className="rounded-lg border border-border bg-background/60 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Estado atual</p><div className="mt-3 flex items-center justify-between gap-3"><div><p className="font-semibold text-foreground">Recebimento pausado</p><p className="mt-1 text-sm text-muted-foreground">A equipe ainda pode consultar historico, mas nao recebe novos contatos.</p></div><span className="flex h-3 w-3 rounded-full bg-destructive shadow-[0_0_0_4px_hsl(var(--destructive)/0.12)]" /></div></div>{(a == null ? void 0 : a.phone_number) && <div className="rounded-lg border border-border bg-background/60 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Ultimo numero conectado</p><div className="mt-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Oe className="h-4 w-4" /></div><span className="font-semibold text-foreground">{a.phone_number}</span></div></div>}{K}</div><div className="rounded-lg border border-border bg-background/60 p-4"><div className="mb-4 flex items-start justify-between gap-3"><div><p className="font-semibold text-foreground">Reconectar conta WhatsApp Business</p><p className="mt-1 text-sm text-muted-foreground">Use o celular oficial da imobiliaria para manter o atendimento centralizado.</p></div><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><_t className="h-5 w-5" /></div></div><label className="text-xs font-semibold text-muted-foreground">Numero para pareamento por codigo</label><input type="tel" value={f} onChange={I => S(I.target.value)} placeholder="Ex: 5599999999999" className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent" /><p className="mt-2 text-xs leading-5 text-muted-foreground">Opcional. Se o QR nao for lido no Android, informe o numero do celular e use o codigo exibido.</p><m className="mt-5 w-full gap-2" size="lg" onClick={y ? R : b} disabled={d.isPending}>{d.isPending ? <fe className="h-4 w-4 animate-spin" /> : <_t className="h-4 w-4" />}{d.isPending ? "Gerando..." : "Gerar QR Code"}</m></div></div></section><aside className="rounded-lg border border-border bg-card p-5 shadow-sm"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"><Jt className="h-5 w-5" /></div><div><h4 className="font-semibold text-foreground">Checklist rapido</h4><p className="mt-1 text-sm text-muted-foreground">Antes de reconectar, confira estes pontos para evitar falhas recorrentes.</p></div></div><div className="mt-5 space-y-3">{["O celular da imobiliaria esta com internet.", "Ha vaga para novo aparelho conectado no WhatsApp.", "O app WhatsApp esta aberto em Aparelhos conectados.", "Apos escanear, aguarde o status mudar para conectado."].map(I => <div className="flex gap-3 rounded-lg border border-border bg-background/60 p-3"><Jt className="mt-0.5 h-4 w-4 shrink-0 text-success" /><p className="text-sm leading-5 text-foreground">{I}</p></div>)}</div><div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900"><p className="text-sm font-semibold">Limite do WhatsApp</p><p className="mt-1 text-sm leading-5">Se aparecer erro ao conectar, remova um dispositivo antigo em Aparelhos conectados e tente novamente.</p></div></aside></div></div>;
  }
  if (a.status === "qr_ready" && (a.qr_code || a.pairing_code) && O) return <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 py-8 relative"><m variant="ghost" size="icon" className="absolute right-4 top-4" onClick={M}><xe className="h-6 w-6 text-muted-foreground" /></m><h3 className="mb-2 text-2xl font-semibold text-foreground">Conectar WhatsApp da Imobiliária</h3><p className="mb-6 max-w-2xl text-center text-sm leading-6 text-muted-foreground">Abra o <strong>WhatsApp no celular da imobiliária</strong>, vá em <strong>Menu &gt; Aparelhos conectados &gt; Conectar aparelho</strong> e escaneie o código abaixo.</p>{a.qr_code && <div className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-xl"><img src={a.qr_code.startsWith("data:") ? a.qr_code : `data:image/png;base64,${a.qr_code}`} alt="QR Code WhatsApp" className="aspect-square w-[min(78vw,460px)] bg-white [image-rendering:pixelated]" /></div>}{a.pairing_code && <div className="mb-5 w-full max-w-lg rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Código de pareamento</p><div className="mt-2 flex items-center justify-center gap-2"><span className="font-mono text-3xl font-bold tracking-[0.18em] text-emerald-950">{a.pairing_code}</span><m variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
          var y;
          return (y = navigator.clipboard) == null ? void 0 : y.writeText(a.pairing_code || "");
        }} title="Copiar código"><pr className="h-4 w-4" /></m></div><p className="mt-2 text-xs text-emerald-800">No WhatsApp do Android, abra Aparelhos conectados e escolha a opção de conectar com número/código.</p></div>}<div className="mb-6 grid w-full max-w-3xl gap-3 md:grid-cols-2"><div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800"><p className="font-medium">Importante:</p><p>O WhatsApp permite no máximo <strong>4 dispositivos</strong> conectados simultaneamente.</p><p className="mt-1">Se aparecer "Não é possível conectar novos dispositivos", remova um aparelho em <strong>Menu &gt; Aparelhos conectados</strong> e tente novamente.</p></div><div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground"><p className="font-medium text-foreground">Se o QR nao ler</p><p className="mt-1">Clique em cancelar, informe o numero com DDI/DDD no campo de pareamento e conecte novamente para gerar codigo.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input type="tel" value={f} onChange={y => S(y.target.value)} placeholder="Ex: 5555999999999" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" /><m type="button" variant="secondary" className="shrink-0" onClick={ue} disabled={p.isPending || d.isPending}>Gerar codigo</m></div>{k && <p className={z ? "mt-2 font-medium text-destructive" : "mt-2"}>{z ? "Este QR pode ter expirado. Gere um novo." : `Expira por volta de ${k.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          })}.`}</p>}</div></div><div className="w-full max-w-md mb-4">{K}</div><div className="flex flex-col gap-2 sm:flex-row"><m variant="outline" onClick={() => n()} className="gap-2"><La className="h-4 w-4" />Atualizar status</m><m variant="outline" onClick={M} disabled={p.isPending} className="gap-2"><wt className="h-4 w-4" />Cancelar e gerar novo</m></div></div>;
  if (a.status === "connecting") {
    const I = (g ? Math.floor((Date.now() - g) / 1e3) : 0) > 10;
    return <div className="flex flex-col items-center justify-center py-16 px-4"><div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><fe className="h-10 w-10 text-primary animate-spin" /></div><h3 className="text-xl font-semibold text-foreground mb-2">Conectando WhatsApp da Imobiliária...</h3><p className="text-muted-foreground text-center max-w-md">Aguardando QR Code. Isso pode levar alguns segundos.</p>{I && <div className="mt-6 max-w-md bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3"><hr className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /><div className="text-sm text-amber-800"><p className="font-medium">O serviço de conexão WhatsApp pode estar indisponível.</p><p className="mt-1">Verifique a conexão do WhatsApp e tente novamente em alguns instantes.</p><m variant="outline" size="sm" className="mt-3 border-amber-300 text-amber-800 hover:bg-amber-100" onClick={M}>Cancelar</m></div></div>}<div className="w-full max-w-md mt-6">{K}</div></div>;
  }
  return a.status === "error" ? <div className="flex flex-col items-center justify-center py-16 px-4"><div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6"><Ua className="h-10 w-10 text-destructive" /></div><h3 className="text-xl font-semibold text-foreground mb-2">Erro na conexão da Imobiliária</h3><p className="text-muted-foreground text-center max-w-md mb-2">{a.last_error || "Não foi possível conectar o WhatsApp da imobiliária ao sistema."}</p><div className="flex gap-3 mt-4"><m variant="outline" onClick={M} disabled={p.isPending}>Desconectar</m><m onClick={b} disabled={d.isPending}>Tentar novamente</m></div><div className="w-full max-w-md mt-6">{K}</div></div> : a.status === "connected" ? <Ci className="max-w-md mx-auto mt-8"><ki className="flex flex-row items-center gap-4"><div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><fr className="h-6 w-6 text-emerald-500" /></div><div><Si>WhatsApp da Imobiliária Conectado</Si><Ai>{a.phone_number ? `Número: ${a.phone_number}` : "Sessão ativa"}</Ai></div></ki><Ei><p className="text-sm text-muted-foreground mb-4">O WhatsApp da imobiliária está conectado. As mensagens de clientes aparecem automaticamente na Central de Atendimento.</p><div className="mb-4">{K}</div><m variant="outline" size="sm" onClick={M} disabled={p.isPending}><wt className="h-4 w-4 mr-2" />Desconectar</m></Ei></Ci> : null;
}
var ro = ["a", "button", "div", "form", "h2", "h3", "img", "input", "label", "li", "nav", "ol", "p", "select", "span", "svg", "ul"],
  no = ro.reduce((s, a) => {
    const l = kn(`Primitive.${a}`),
      n = i.forwardRef((d, p) => {
        const {
            asChild: h,
            ...g
          } = d,
          w = h ? l : a;
        return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), <w ref={p} />;
      });
    return n.displayName = `Primitive.${a}`, {
      ...s,
      [a]: n
    };
  }, {}),
  io = "Separator",
  cr = "horizontal",
  oo = ["horizontal", "vertical"],
  Rr = i.forwardRef((s, a) => {
    const {
        decorative: l,
        orientation: n = cr,
        ...d
      } = s,
      p = lo(n) ? n : cr,
      g = l ? {
        role: "none"
      } : {
        "aria-orientation": p === "vertical" ? p : void 0,
        role: "separator"
      };
    return <no.div data-orientation={p} ref={a} />;
  });
Rr.displayName = io;
function lo(s) {
  return oo.includes(s);
}
var zr = Rr;
const Qa = i.forwardRef(({
  className: s,
  orientation: a = "horizontal",
  decorative: l = !0,
  ...n
}, d) => <zr ref={d} decorative={l} orientation={a} className={q("shrink-0 bg-border", a === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", s)} />);
Qa.displayName = zr.displayName;
function co(s) {
  switch (s) {
    case "connected":
      return {
        label: "WhatsApp da imobiliária conectado",
        color: "bg-emerald-500",
        textColor: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        icon: Oa
      };
    case "connecting":
      return {
        label: "Iniciando conexão da imobiliária...",
        color: "bg-amber-500",
        textColor: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        icon: La
      };
    case "qr_ready":
      return {
        label: "Escaneie o QR Code no celular da imobiliária",
        color: "bg-blue-500",
        textColor: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: _t
      };
    case "error":
      return {
        label: "Falha na conexão da imobiliária",
        color: "bg-red-500",
        textColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: Ua
      };
    case "disconnected":
    default:
      return {
        label: "WhatsApp da imobiliária desconectado",
        color: "bg-slate-400",
        textColor: "text-slate-600",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        icon: Oa
      };
  }
}
function mo({
  open: s,
  onOpenChange: a
}) {
  const {
      profile: l
    } = Ba(),
    isAdmin = (l == null ? void 0 : l.role) === "admin" && (l == null ? void 0 : l.email) !== "jota@imobiliaria.com",
    {
      data: n,
      isLoading: d,
      refetch: p
    } = Ka(),
    h = gr(),
    g = br(),
    w = vr(),
    [f, S] = i.useState(null),
    [A, k] = i.useState(""),
    z = (n == null ? void 0 : n.ai_enabled) !== !1;
  i.useEffect(() => {
    if (!(l != null && l.tenant_id)) return;
    const F = B.channel("whatsapp-settings-realtime").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "whatsapp_sessions",
      filter: `tenant_id=eq.${l.tenant_id}`
    }, () => p()).subscribe();
    return () => {
      F.unsubscribe();
    };
  }, [l == null ? void 0 : l.tenant_id, p]), i.useEffect(() => {
    (n == null ? void 0 : n.status) === "connecting" ? f || S(Date.now()) : S(null);
  }, [n == null ? void 0 : n.status, f]);
  const O = () => {
      S(Date.now());
      const F = A.replace(/\D/g, "");
      h.mutate(F ? {
        phone_number: F
      } : void 0, {
        onSuccess: () => ne.info("Sessão iniciada. Escaneie o QR Code quando aparecer."),
        onError: le => ne.error((le == null ? void 0 : le.message) || "Erro ao iniciar sessão")
      });
    },
    W = () => {
      g.mutate(void 0, {
        onSuccess: () => ne.success("Sessão desconectada"),
        onError: F => ne.error((F == null ? void 0 : F.message) || "Erro ao desconectar")
      });
    },
    b = F => {
      w.mutate({
        enabled: F
      }, {
        onSuccess: () => ne.success(F ? "IA ativada" : "IA pausada"),
        onError: le => ne.error((le == null ? void 0 : le.message) || "Erro ao atualizar IA")
      });
    },
    R = co((n == null ? void 0 : n.status) || "disconnected"),
    M = R.icon,
    ue = f ? Math.floor((Date.now() - f) / 1e3) : 0,
    ce = (n == null ? void 0 : n.status) === "connecting" && ue > 10,
    K = n != null && n.qr_expires_at ? new Date(n.qr_expires_at) : null,
    y = !!K && K.getTime() <= Date.now(),
    I = F => F ? new Date(F).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) : "—";
  return <mi open={s} onOpenChange={a}><ui className="w-full overflow-y-auto sm:max-w-xl"><xi className="pb-4"><pi className="flex items-center gap-2"><Oa className="h-5 w-5 text-muted-foreground" />Conexão WhatsApp Business</pi><hi>Gerencie a conta do WhatsApp da imobiliária integrada ao sistema. Os clientes enviam mensagens para este número e você as recebe aqui na Central de Atendimento.</hi></xi>{d ? <div className="flex items-center justify-center py-12"><fe className="h-8 w-8 animate-spin text-primary" /></div> : <div className="space-y-6"><div className="rounded-xl border bg-slate-50 border-slate-200 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Kn className="h-5 w-5" /></div><div className="flex-1"><p className="font-semibold text-foreground text-sm">Conta da Imobiliária</p><p className="text-xs text-muted-foreground">{n != null && n.phone_number ? `Número conectado: ${n.phone_number}` : "Nenhuma conta conectada"}</p></div><span className={`inline-flex h-2 w-2 rounded-full ${R.color}`} /></div></div><div className={`rounded-xl border p-4 ${R.bgColor} ${R.borderColor}`}><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white"><M className={`h-5 w-5 ${R.textColor} ${(n == null ? void 0 : n.status) === "connecting" ? "animate-spin" : ""}`} /></div><div className="flex-1"><p className={`font-semibold text-sm ${R.textColor}`}>{R.label}</p><p className="text-xs text-muted-foreground mt-0.5">Status da integração com WhatsApp</p></div></div>{(n == null ? void 0 : n.phone_number) && n.status === "connected" && <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/60 p-2"><Oe className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-medium text-foreground">{n.phone_number}</span><span className="text-[10px] text-muted-foreground ml-auto">WhatsApp Business</span></div>}{(n == null ? void 0 : n.last_connected_at) && n.status === "connected" && <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Ga className="h-3.5 w-3.5" /><span>Conectado desde {I(n.last_connected_at)}</span></div>}{(n == null ? void 0 : n.status) === "connecting" && <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700"><fe className="h-3.5 w-3.5 animate-spin" /><span>Aguardando QR Code no celular da imobiliária... ({ue}s)</span></div>}{(n == null ? void 0 : n.last_error) && n.status === "error" && <div className="mt-3 rounded-lg bg-red-100 border border-red-200 p-2.5 text-xs text-red-800"><div className="flex items-start gap-1.5"><Ua className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{n.last_error}</span></div></div>}</div><div className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><Nt className="h-5 w-5" /></div><div className="min-w-0"><p className="text-sm font-semibold text-foreground">Inteligencia artificial</p><p className="text-xs text-muted-foreground">{z ? "Novas mensagens acionam a IA." : "Novas mensagens entram sem resposta automatica."}</p></div></div><Ht checked={z} onCheckedChange={b} disabled={w.isPending} aria-label="Ativar ou pausar inteligencia artificial" /></div></div>{(n == null ? void 0 : n.status) === "qr_ready" && (n.qr_code || n.pairing_code) && <div className="space-y-3"><div className="flex items-center gap-2"><_t className="h-4 w-4 text-muted-foreground" /><h4 className="text-sm font-medium text-foreground">Conectar celular da imobiliária</h4></div>{n.qr_code && <div className="flex justify-center"><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg"><img src={n.qr_code.startsWith("data:") ? n.qr_code : `data:image/png;base64,${n.qr_code}`} alt="QR Code WhatsApp" className="aspect-square w-[min(82vw,420px)] bg-white [image-rendering:pixelated]" /></div></div>}{n.pairing_code && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Codigo de pareamento</p><div className="mt-2 flex items-center justify-center gap-2"><span className="font-mono text-2xl font-bold tracking-[0.18em] text-emerald-950">{n.pairing_code}</span><m variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                var F;
                return (F = navigator.clipboard) == null ? void 0 : F.writeText(n.pairing_code || "");
              }} title="Copiar código"><pr className="h-4 w-4" /></m></div><p className="mt-2 text-xs text-emerald-800">No WhatsApp do Android, abra Aparelhos conectados e escolha a opção de conectar com número/código.</p></div>}<div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1.5"><p className="text-xs font-medium text-amber-800">Como conectar:</p><ol className="text-xs text-amber-700 list-decimal list-inside space-y-0.5"><li>Abra o <strong>WhatsApp no celular da imobiliária</strong></li><li>Vá em <strong>Menu &gt; Aparelhos conectados &gt; Conectar aparelho</strong></li><li>Aponte a câmera para o QR Code acima</li></ol></div><p className="text-xs text-muted-foreground text-center">{y ? "Este QR pode ter expirado. Cancele e gere um novo." : "O QR Code expira em poucos minutos."}{K && !y ? ` Expira por volta de ${K.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit"
            })}.` : ""}</p></div>}{ce && <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-3"><hr className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" /><div className="text-sm text-amber-800"><p className="font-medium">O serviço de conexão pode estar indisponível.</p><p className="mt-1 text-xs">Verifique a conexão do WhatsApp e tente novamente em alguns instantes.</p></div></div>}<Qa /><div className="space-y-3"><h4 className="text-sm font-medium text-foreground">Ações</h4>{(!n || n.status === "disconnected" || n.status === "error") && <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground">Número para pareamento por código</label><input type="tel" value={A} onChange={F => k(F.target.value)} placeholder="Ex: 5599999999999" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" /><p className="text-[11px] text-muted-foreground">Opcional. Use quando o Android não conseguir ler o QR Code.</p></div>}{!n || n.status === "disconnected" ? <m className="w-full gap-2" onClick={O} disabled={h.isPending}>{h.isPending ? <fe className="h-4 w-4 animate-spin" /> : <_t className="h-4 w-4" />}{h.isPending ? "Iniciando..." : "Conectar WhatsApp"}</m> : n.status === "connected" ? <m variant="outline" className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={W} disabled={g.isPending}>{g.isPending ? <fe className="h-4 w-4 animate-spin" /> : <wt className="h-4 w-4" />}{g.isPending ? "Desconectando..." : "Desconectar WhatsApp"}</m> : n.status === "error" ? <div className="flex gap-2"><m variant="outline" className="flex-1 gap-2" onClick={W} disabled={g.isPending}><wt className="h-4 w-4" />Desconectar</m><m className="flex-1 gap-2" onClick={O} disabled={h.isPending}>{h.isPending ? <fe className="h-4 w-4 animate-spin" /> : <fr className="h-4 w-4" />}Tentar novamente</m></div> : <m variant="outline" className="w-full gap-2" onClick={W} disabled={g.isPending}>{g.isPending ? <fe className="h-4 w-4 animate-spin" /> : <xe className="h-4 w-4" />}Cancelar conexão</m>}</div><Qa /><div className="space-y-3"><h4 className="text-sm font-medium text-foreground">Informações da sessão</h4><div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Sessão</span><span className="font-medium">{(n == null ? void 0 : n.session_name) || "default"}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{(n == null ? void 0 : n.status) || "disconnected"}</span></div>{(n == null ? void 0 : n.created_at) && <div className="flex justify-between"><span className="text-muted-foreground">Criado em</span><span className="font-medium">{I(n.created_at)}</span></div>}{(n == null ? void 0 : n.updated_at) && <div className="flex justify-between"><span className="text-muted-foreground">Atualizado em</span><span className="font-medium">{I(n.updated_at)}</span></div>}</div></div><div className="rounded-lg border bg-blue-50/50 p-3 space-y-2"><div className="flex items-center gap-2 text-sm font-medium text-blue-800"><Wa className="h-4 w-4" /><span>Como funciona a integração</span></div><ul className="text-xs text-blue-700 space-y-1.5 list-disc list-inside"><li>Esta é a <strong>conta do WhatsApp da imobiliária</strong> conectada ao sistema.</li><li>Quando um cliente envia mensagem para este número, ela <strong>aparece aqui na Central de Atendimento</strong>.</li><li>Você responde pelo sistema e a mensagem é <strong>enviada pelo WhatsApp da imobiliária</strong>.</li><li>O WhatsApp permite no máximo <strong>4 dispositivos</strong> conectados simultaneamente.</li><li>Mantenha a conexão WhatsApp ativa para não perder mensagens.</li></ul></div></div>}</ui></mi>;
}
function uo({
  conversation: s,
  onSelectParticipant: a
}) {
  var g, w, f, S, A;
  const [l, n] = i.useState([]),
    [d, p] = i.useState(!0);
  i.useEffect(() => {
    (async () => {
      var z;
      if (p(!0), !!((z = s.client) != null && z.id)) try {
        const cleanPhone = (s.client?.phone || "").replace(/\D/g, "");
        const jid = cleanPhone + "@g.us";
        const {
          data: rawO,
          error: W
        } = await B.from("group_participants").select("id, group_id, role, is_admin, profile:profiles!group_participants_profile_id_fkey(id, full_name, phone, avatar_url)").or("group_id.eq." + s.client.id + ",group_id.eq." + cleanPhone + ",group_id.eq." + jid);
        const O = rawO ? rawO.map(it => ({
          participation_id: it.id,
          group_id: it.group_id,
          group_role: it.role === "admin" || it.is_admin ? "admin" : "member",
          profile_id: it.profile?.id,
          full_name: it.profile?.full_name || it.profile?.phone || "Membro",
          phone: it.profile?.phone || "",
          avatar_url: it.profile?.avatar_url
        })) : [];
        O ? n(O) : console.log("Group participants table/view not ready yet");
      } catch (O) {
        console.error(O);
      } finally {
        p(!1);
      }
    })();
  }, [(g = s.client) == null ? void 0 : g.id]);
  const h = k => k ? k.substring(0, 2).toUpperCase() : "GP";
  return <div className="p-6 h-full flex flex-col"><div className="text-center mb-6"><_e className="h-20 w-20 mx-auto mb-3">{(w = s.client) != null && w.avatar_url ? <Ce src={s.client.avatar_url} alt={((f = s.client) == null ? void 0 : f.full_name) || "Grupo"} className="object-cover" /> : null}<ke className="text-2xl bg-indigo-500 text-white">{h((S = s.client) == null ? void 0 : S.full_name)}</ke></_e><h3 className="font-semibold text-lg text-foreground">{((A = s.client) == null ? void 0 : A.full_name) || "Grupo Sem Nome"}</h3><p className="text-sm text-muted-foreground">Grupo de WhatsApp</p><div className="flex items-center justify-center gap-2 mt-3"><U variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-200">{l.length} Participantes</U><U variant="outline" className="text-[10px]">{s.status === "open" ? "Atendimento Ativo" : "Atendimento Encerrado"}</U></div><div className="flex items-center justify-center gap-3 mt-4"><m variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          var k, z;
          return window.open(`https://wa.me/${(z = (k = s.client) == null ? void 0 : k.phone) == null ? void 0 : z.replace(/\D/g, "")}`, "_blank");
        }}><Oe className="h-3 w-3" /> Abrir WhatsApp</m></div></div><div className="rounded-lg border bg-muted/30 flex-1 flex flex-col overflow-hidden"><div className="p-4 border-b bg-muted/50 flex items-center justify-between"><h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Le className="h-3.5 w-3.5" /> Participantes do Grupo</h4><span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-semibold text-muted-foreground">{l.length}</span></div><div className="px-3 pt-2 pb-1 border-b border-border/50"><input type="text" value={qSearch} onChange={ev => setQSearch(ev.target.value)} placeholder="Buscar por nome ou telefone..." className="w-full text-xs bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground" /></div><div className="p-3 overflow-y-auto flex-1 space-y-3">{d ? <div className="flex items-center justify-center py-6"><fe className="h-5 w-5 animate-spin text-muted-foreground" /></div> : l.filter(k => !qSearch || k.full_name && k.full_name.toLowerCase().includes(qSearch.toLowerCase()) || k.phone && k.phone.includes(qSearch)).length > 0 ? l.filter(k => !qSearch || k.full_name && k.full_name.toLowerCase().includes(qSearch.toLowerCase()) || k.phone && k.phone.includes(qSearch)).map(k => <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border"><div className="flex items-center gap-2"><_e className="h-8 w-8">{k.avatar_url && <Ce src={k.avatar_url} />}<ke className="text-[10px]">{h(k.full_name)}</ke></_e><div className="flex flex-col"><span className="text-xs font-medium text-foreground max-w-[150px] truncate">{k.full_name || k.phone || "Sem Nome"}{k.full_name && k.phone && <span className="text-[10px] font-normal text-muted-foreground ml-1 opacity-80">({k.phone})</span>}</span><span className="text-[10px] text-muted-foreground">{k.group_role === "admin" ? "Administrador" : "Membro"}</span></div></div><div className="flex items-center gap-1.5">{k.lead_id ? <U variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200 shrink-0">Lead</U> : <U variant="outline" className="text-[9px] text-muted-foreground shrink-0">Contato</U>}{a && k.phone && <m variant="ghost" size="icon" className="h-7 w-7 text-accent hover:text-accent hover:bg-accent/10 rounded-full shrink-0" onClick={() => a(k.profile_id, k.phone, k.full_name || "")} title="Conversa Privada"><he className="h-3.5 w-3.5" /></m>}</div></div>) : <div className="text-center py-6 text-sm text-muted-foreground"><Le className="h-8 w-8 mx-auto mb-2 opacity-20" /><p>Nenhum participante mapeado</p><p className="text-xs mt-1">O banco de dados de participantes ainda não foi populado.</p></div>}</div></div></div>;
}
const xo = s => {
    var a;
    return ((a = s.match(/https?:\/\/[^\s]+/g)) == null ? void 0 : a[0]) || null;
  },
  po = (s, a, c) => {
    const l = s.trim().toLowerCase();
    if (l === "[midia]" || l.startsWith("[midia indisponivel]") || l.startsWith("[mídia indisponível]")) return <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"><rt className="h-4 w-4 shrink-0" /><span>Mídia recebida, mas o arquivo não ficou disponível.</span></div>;
    if (a === "image" || s.startsWith("[Imagem]")) {
      const n = s.match(/https?:\/\/[^\s]+/g);
      if (n) {
        const d = n[0];
        return <div className="rounded-lg overflow-hidden border border-border max-w-[300px] bg-muted/20"><img src={d} alt="Imagem" className="w-full h-auto object-contain max-h-[200px] hover:scale-[1.02] transition-transform duration-200" /></div>;
      }
    }
    if (a === "video" || s.startsWith("[Video]")) {
      const n = s.match(/https?:\/\/[^\s]+/g);
      if (n) {
        const d = n[0],
          p = s.replace(/\[Video\]\s*/, "").split(`
`)[0] || "Vídeo";
        return <div className="space-y-2"><div className="rounded-lg overflow-hidden border border-border max-w-[320px] bg-muted/20"><video src={d} controls={!0} className="w-full h-auto object-contain max-h-[240px]" /></div><span className="text-xs opacity-75 underline block truncate max-w-[200px]"><a href={d} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{p}</a></span></div>;
      }
    }
    if (a === "audio" || s.startsWith("[Audio]") || s.startsWith("[Áudio]")) {
      const n = xo(s);
      if (n) return <div className="space-y-1.5 py-1 w-[min(280px,70vw)] max-w-full"><audio controls={!0} preload="metadata" className="w-full h-10 accent-accent"><source src={n} type="audio/ogg; codecs=opus" /><source src={n} type="audio/ogg" /><source src={n} type="audio/mpeg" /><source src={n} type="audio/mp4" /></audio><div className="flex items-center justify-between pt-1 border-t border-border/40"><span className="text-[10px] text-muted-foreground">Áudio PTT</span><button type="button" onClick={() => window.dispatchEvent(new CustomEvent("openAudioFailSafe", {
            detail: {
              audioUrl: n,
              content: s,
              conversationId: c && c.id || null,
              phone: c && c.client && c.client.phone || null
            }
          }))} className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 transition-all cursor-pointer" title="Acionar contingência de áudio"><span>⚠️</span>Falhou Áudio?</button></div></div>;
    }
    if (a === "document" || s.startsWith("[Arquivo]")) {
      const n = s.match(/https?:\/\/[^\s]+/g);
      if (n) {
        const d = n[0],
          p = s.replace(/\[Arquivo\]\s*/, "").split(`
`)[0] || "Documento";
        return <a href={d} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors border border-border text-sm font-medium hover:text-accent"><rt className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate max-w-[180px]">{p}</span></a>;
      }
    }
    return <p className="text-sm whitespace-pre-line leading-relaxed break-words [overflow-wrap:anywhere]">{s}</p>;
  },
  Ye = s => {
    const a = s.toLowerCase().trim();
    if (a === "quente") return "bg-red-50 text-red-700 border-red-200/60";
    if (a === "frio") return "bg-blue-50 text-blue-700 border-blue-200/60";
    if (a === "visita" || a === "visita agendada") return "bg-purple-50 text-purple-700 border-purple-200/60";
    if (a === "negociação") return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    if (a === "pendente") return "bg-amber-50 text-amber-700 border-amber-200/60";
    const l = ["bg-slate-50 text-slate-700 border-slate-200", "bg-indigo-50 text-indigo-700 border-indigo-200", "bg-rose-50 text-rose-700 border-rose-200", "bg-cyan-50 text-cyan-700 border-cyan-200", "bg-teal-50 text-teal-700 border-teal-200"];
    let n = 0;
    for (let d = 0; d < s.length; d++) n += s.charCodeAt(d);
    return l[n % l.length];
  },
  dr = s => s ? s.endsWith("@estateia.com") || s.endsWith(".clie") || s.includes("estateia") : !0,
  Ft = s => (s || "").replace(/\D/g, ""),
  at = s => {
    switch (s) {
      case "follow_up_atrasado":
        return "Follow-up";
      case "qualificar_lead":
        return "Qualificar";
      case "buscar_imoveis":
        return "Buscar imóveis";
      case "indicar_imovel":
        return "Indicar imóvel";
      case "agendar_visita":
        return "Agendar visita";
      case "confirmar_visita":
        return "Confirmar visita";
      case "enviar_opcoes":
        return "Enviar opcoes";
      case "match_pronto":
        return "Match pronto";
      case "retomar_ia":
        return "Retomar IA";
      case "priorizar_corretor":
        return "Prioridade";
      case "ia_pausada":
        return "Manual";
      case "acompanhar":
        return "Acompanhar";
      case "sem_acao":
        return "Sem ação";
      default:
        return "Próxima ação";
    }
  },
  Qt = s => {
    switch (s) {
      case "follow_up_atrasado":
        return "border-red-200 bg-red-50 text-red-700";
      case "priorizar_corretor":
        return "border-orange-200 bg-orange-50 text-orange-700";
      case "qualificar_lead":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "buscar_imoveis":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "indicar_imovel":
        return "border-violet-200 bg-violet-50 text-violet-700";
      case "agendar_visita":
      case "confirmar_visita":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "match_pronto":
      case "enviar_opcoes":
        return "border-violet-200 bg-violet-50 text-violet-700";
      case "retomar_ia":
        return "border-cyan-200 bg-cyan-50 text-cyan-700";
      case "ia_pausada":
        return "border-slate-200 bg-slate-50 text-slate-700";
      default:
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
  },
  jt = s => ({
    tipo_finalidade: "Tipo/finalidade",
    tipo: "Tipo",
    finalidade: "Finalidade",
    quartos_suites: "Quartos",
    quartos: "Quartos",
    suites: "Suites",
    tamanho: "Tamanho",
    area_util: "Area",
    localizacao: "Localização",
    faixa_valor: "Valor",
    valor: "Valor",
    budget_min: "Valor minimo",
    budget_max: "Valor maximo",
    bairro: "Bairro",
    cidade: "Cidade",
    perfil_familiar: "Perfil familiar",
    necessidades: "Necessidades",
    necessidade_especial: "Necessidade especial",
    urgencia: "Urgência"
  })[s] || s.replace(/_/g, " "),
  Yt = s => {
    const a = typeof s == "string" ? Number(s) : s;
    return Number.isFinite(a || NaN) ? new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(a) : "Valor sob consulta";
  },
  qa = s => {
    if (!s) return 0;
    if (s.perfil_completo) return 100;
    const a = s.missing_count ?? (s.missing_fields || []).length;
    return Math.max(0, Math.min(100, Math.round((8 - a) / 8 * 100)));
  },
  ho = s => s == null ? "Sem score" : s >= 80 ? "Quente" : s >= 55 ? "Morno" : "Frio",
  fo = s => {
    switch (s) {
      case "follow_up_atrasado":
        return "Cliente ficou sem retorno recente. Reabra com contexto e uma pergunta simples.";
      case "qualificar_lead":
        return "Faltam dados para o agente filtrar bons imoveis sem chute.";
      case "buscar_imoveis":
        return "Perfil suficiente para procurar opcoes antes de responder.";
      case "indicar_imovel":
      case "match_pronto":
      case "enviar_opcoes":
        return "Ha indicacao pronta. Envie a opcao e convide para visita.";
      case "agendar_visita":
      case "confirmar_visita":
        return "Cliente esta pronto para agenda. Confirme dia, horario e nome completo.";
      case "priorizar_corretor":
        return "Lead de alta prioridade. Assuma manualmente e avance com cuidado.";
      case "ia_pausada":
        return "IA pausada. O corretor precisa conduzir a conversa.";
      case "retomar_ia":
        return "A conversa pode voltar para a IA depois da checagem manual.";
      default:
        return "Monitore a conversa e mantenha o proximo passo claro.";
    }
  },
  qr = s => "Estou separando as opcoes que mais combinam com o que voce procura. Se quiser, ja posso te mandar as melhores e vemos uma visita em seguida.",
  Dr = s => {
    var a;
    return s && (s.image_url || ((a = s.images) == null ? void 0 : a.find(Boolean))) || null;
  },
  Tr = s => !s || typeof window > "u" ? null : `${window.location.origin}/imoveis?property=${s}`,
  mr = s => {
    if (!s) return qr();
    const a = [s.bedrooms ? `${s.bedrooms} quarto(s)` : null, s.bathrooms ? `${s.bathrooms} banheiro(s)` : null, s.parking ? `${s.parking} vaga(s)` : null, s.area ? `${s.area}` : null].filter(Boolean).join(" | "),
      l = (s.match_reasons || []).slice(0, 3).join(", "),
      n = Dr(s),
      d = Tr(s.property_id);
    return ["Separei este imovel cadastrado que combina com o que voce procura:", "", `*${s.property_title}*${s.property_code ? ` (${s.property_code})` : ""}`, `Localizacao: ${s.property_location || s.property_address || "sob consulta"}`, `Valor: ${Yt(s.property_price)}`, a ? `Detalhes: ${a}` : null, l ? `Por que combina: ${l}` : null, n ? `Foto: ${n}` : null, d ? `Link: ${d}` : null, "", "Quer que eu agende uma visita para voce conhecer?"].filter(p => p !== null).join(`
`);
  },
  Da = s => {
    const a = s.slice(0, 3);
    return a.length ? [`Encontrei ${a.length} opcao${a.length > 1 ? "es" : ""} cadastrada${a.length > 1 ? "s" : ""} que combina${a.length > 1 ? "m" : ""} com o que voce procura:`, "", ...a.map((l, n) => {
      const d = [l.bedrooms ? `${l.bedrooms} quarto(s)` : null, l.parking ? `${l.parking} vaga(s)` : null, l.area || null].filter(Boolean).join(" | ");
      return `${n + 1}. ${l.property_title}${l.property_code ? ` (${l.property_code})` : ""} - ${Yt(l.property_price)} - ${l.property_location}${d ? ` - ${d}` : ""}`;
    }), "", "Qual dessas voce quer conhecer melhor ou agendar visita?"].join(`
`) : qr();
  },
  Ta = s => `Consigo agendar uma visita para voce conhecer ${(s == null ? void 0 : s.property_address) || (s == null ? void 0 : s.property_location) || "o imovel"}. Qual dia e horario funcionam melhor para voce?`,
  go = (s, a, l) => {
    var h, g;
    const n = [a != null && a.tipo_imovel_p1 ? `Tipo/finalidade: ${a.tipo_imovel_p1}` : null, a != null && a.p2_quartos_suites ? `Quartos/suites: ${a.p2_quartos_suites}` : null, a != null && a.p3_tamanho_imovel ? `Tamanho: ${a.p3_tamanho_imovel}` : null, a != null && a.p4_localizacao ? `Localizacao: ${a.p4_localizacao}` : null, a != null && a.p5_faixa_valor ? `Faixa de valor: ${a.p5_faixa_valor}` : null, a != null && a.p6_perfil_familiar ? `Perfil familiar: ${a.p6_perfil_familiar}` : null, a != null && a.p7_necessidades_especiais ? `Necessidades: ${a.p7_necessidades_especiais}` : null, a != null && a.p8_urgencia ? `Urgencia: ${a.p8_urgencia}` : null].filter(Boolean),
      d = ((a == null ? void 0 : a.missing_fields) || []).map(jt),
      p = l.slice(0, 3).map((w, f) => `${f + 1}. ${w.property_title}${w.property_code ? ` (${w.property_code})` : ""} - ${Yt(w.property_price)} - score ${w.match_score}`);
    return ["Resumo para corretor", `Cliente: ${((h = s == null ? void 0 : s.client) == null ? void 0 : h.full_name) || (a == null ? void 0 : a.name) || "Cliente"}`, `Telefone: ${((g = s == null ? void 0 : s.client) == null ? void 0 : g.phone) || (a == null ? void 0 : a.phone) || "Nao informado"}`, a != null && a.stage ? `Etapa: ${a.stage}` : null, a != null && a.next_action ? `Proxima acao: ${at(a.next_action)}` : null, "", "Perfil capturado:", n.length ? n.join(`
`) : "Ainda faltam informacoes de perfil.", d.length ? `Campos pendentes: ${d.join(", ")}` : "Campos essenciais preenchidos.", "", "Imoveis sugeridos:", p.length ? p.join(`
`) : "Nenhum imovel estruturado sugerido ainda.", "", "Orientacao: assuma a conversa com contexto, valide o interesse no melhor match e avance para visita."].filter(w => w !== null).join(`
`);
  };
class bo extends wn.Component {
  constructor(a) {
    super(a), this.state = {
      hasError: !1,
      error: null,
      info: null
    };
  }
  static getDerivedStateFromError(a) {
    return {
      hasError: !0,
      error: a
    };
  }
  componentDidCatch(a, l) {
    this.setState({
      info: l
    }), console.error("Atendimento Crash:", a, l);
  }
  render() {
    var a, l;
    return this.state.hasError ? <div style={{
      padding: 40,
      color: "#990000",
      background: "#ffebee",
      height: "100vh",
      width: "100vw",
      overflow: "auto"
    }}><h1 style={{
        fontSize: 24,
        fontWeight: "bold"
      }}>TELA BRANCA - RELATÓRIO DE ERRO</h1><p>Por favor, tire um print desta tela e me envie.</p><pre style={{
        whiteSpace: "pre-wrap",
        marginTop: 20,
        background: "#fff",
        padding: 20,
        border: "1px solid #f44336"
      }}>{(a = this.state.error) == null ? void 0 : a.toString()}</pre><pre style={{
        whiteSpace: "pre-wrap",
        marginTop: 20,
        background: "#fff",
        padding: 20,
        border: "1px solid #f44336",
        fontSize: 12
      }}>{(l = this.state.info) == null ? void 0 : l.componentStack}</pre></div> : this.props.children;
  }
}
function vo() {
  var $s, Rs, zs, qs, Ds, Ts, Ms, Ls, Os, Ws, Vs, Fs, Qs, Bs, Gs, Us, Ks, Hs, Js, Xs, Ys, Zs, er, tr;
  const s = Nn(),
    [a, l] = i.useState(!1),
    [n, d] = i.useState(!1),
    [p, h] = i.useState(null),
    [g, w] = i.useState(() => {
      try {
        const t = localStorage.getItem("atendimento_active_tab");
        return t === "meus" || t === "equipe" || t === "grupos" || t === "nao-lidas" || t === "arquivadas" ? t : "meus";
      } catch {
        return "meus";
      }
    }),
    [f, S] = i.useState("all"),
    [filtroCorretor, setFiltroCorretor] = i.useState(""),
    A = yn(),
    [k, z] = _n(),
    O = Cn(),
    [W, b] = i.useState(() => k.get("search") || ""),
    [R, M] = i.useState(""),
    [ue, ce] = i.useState(!1),
    K = i.useRef(!1),
    y = i.useRef(null);
  i.useRef(null);
  const [I, F] = i.useState(!1),
    [le, Se] = i.useState(!1),
    [Ae, Ve] = i.useState(""),
    [ge, be] = i.useState("10:00"),
    [Pe, $e] = i.useState(!1),
    [nt, Re] = i.useState(!1),
    [Fe, kt] = i.useState(!1),
    [pe, x] = i.useState(() => {
      try {
        return localStorage.getItem("estate_atendimento_hide_groups") !== "false";
      } catch {
        return !0;
      }
    }),
    [E, P] = i.useState("open"),
    [_, D] = i.useState(null),
    [V, te] = i.useState(""),
    [ee, ve] = i.useState(!1),
    [Zt, Ja] = i.useState(null),
    [it, ot] = i.useState(null),
    [lt, ea] = i.useState(""),
    [Xa, Ya] = i.useState(!1),
    [Za, ta] = i.useState(!1),
    [ct, es] = i.useState(""),
    [aa, ts] = i.useState(""),
    [as, ss] = i.useState(""),
    [sa, rs] = i.useState(!1),
    [Mr, Qe] = i.useState(!1),
    [dt, ns] = i.useState(""),
    [St, is] = i.useState(""),
    [os, ls] = i.useState(""),
    [cs, ds] = i.useState(!1),
    [Lr, ra] = i.useState(!1),
    [Or, mt] = i.useState(!1),
    [At, Et] = i.useState(""),
    [It, Pt] = i.useState(""),
    [na, $t] = i.useState(""),
    [ia, Rt] = i.useState(""),
    ut = i.useRef(null),
    xt = i.useRef(null),
    ms = i.useRef(null),
    us = i.useRef(null),
    [zt, oa] = i.useState(!1),
    [Wr, la] = i.useState(0),
    je = i.useRef(null),
    qt = i.useRef([]),
    ze = i.useRef(null),
    [Be, ca] = i.useState(null),
    [Dt, pt] = i.useState(null),
    [ht, Vr] = i.useState(""),
    [xs, ps] = i.useState(() => {
      try {
        const t = localStorage.getItem("crm_chat_reactions");
        return t ? JSON.parse(t) : {};
      } catch {
        return {};
      }
    }),
    Fr = (t, r) => {
      ps(o => {
        const u = {
          ...o,
          [t]: r
        };
        return localStorage.setItem("crm_chat_reactions", JSON.stringify(u)), u;
      });
    },
    Qr = t => {
      ps(r => {
        const o = {
          ...r
        };
        return delete o[t], localStorage.setItem("crm_chat_reactions", JSON.stringify(o)), o;
      });
    },
    {
      user: j,
      profile: G
    } = Ba(),
    Ge = (G == null ? void 0 : G.role) === "agent",
    [Br, hs] = i.useState(!1),
    fs = ji(),
    qe = wi(),
    {
      data: H = [],
      isLoading: gs
    } = Sn(j == null ? void 0 : j.id, (G == null ? void 0 : G.role) || "admin"),
    {
      data: De = []
    } = An(p),
    {
      data: bs = []
    } = En(!!j),
    vs = [],
    {
      data: Ue,
      isLoading: js
    } = Ka(),
    {
      data: Tt = []
    } = yi(),
    c = H.find(t => t.id === p) || null;
  i.useEffect(() => {
    k.get("search") && z({}, {
      replace: !0
    });
  }, [k, z]);
  const Ns = i.useMemo(() => {
      const t = new Map();
      for (const r of bs) {
        const o = Ft(r.phone);
        if (!o) continue;
        const u = t.get(o);
        (!u || (r.action_priority || 0) > (u.action_priority || 0)) && t.set(o, r);
      }
      return t;
    }, [bs]),
    ft = t => {
      var o;
      const r = Ft((o = t.client) == null ? void 0 : o.phone);
      return r && Ns.get(r) || null;
    },
    Gr = i.useMemo(() => {
      const t = new Map();
      for (const r of vs) {
        const o = Ft(r.lead_phone);
        if (!o) continue;
        const u = t.get(o) || [];
        u.push(r), t.set(o, u);
      }
      for (const [r, o] of t.entries()) t.set(r, o.sort((u, v) => (v.match_score || 0) - (u.match_score || 0)).slice(0, 3));
      return t;
    }, [vs]),
    ws = t => {
      var o;
      const r = Ft((o = t.client) == null ? void 0 : o.phone);
      return r ? Gr.get(r) || [] : [];
    },
    L = c ? ft(c) : null,
    Te = c ? ws(c) : [],
    gt = Te[0] || null,
    da = i.useMemo(() => {
      var r;
      const t = {};
      for (const o of H) {
        if (o.status === "deleted" || o.subject === "[deleted]") continue;
        const u = (r = ft(o)) == null ? void 0 : r.next_action;
        !u || u === "sem_acao" || (t[u] = (t[u] || 0) + 1);
      }
      return t;
    }, [H, Ns]),
    Mt = H.filter(t => {
      var o;
      if (t.status === "deleted" || t.subject === "[deleted]") return !1;
      const r = t.whatsapp_contact && ((o = t.whatsapp_contact[0]) == null ? void 0 : o.is_group);
      return !(pe && r);
    }).length,
    ie = _i(),
    Ur = Pn(),
    ys = $n(),
    ma = Rn(),
    ua = zn(),
    xa = qn(),
    _s = Dn(),
    Ne = (c == null ? void 0 : c.ai_enabled) !== !1;
  L != null && L.suggested_property_id && (L.suggested_property_id, gt == null || gt.property_id), i.useEffect(() => {
    c && (P(c.status || "open"), D(c.agent_id || null));
  }, [c]), i.useEffect(() => {
    localStorage.setItem("atendimento_active_tab", g);
  }, [g]), i.useEffect(() => {
    localStorage.setItem("estate_atendimento_hide_groups", String(pe));
  }, [pe]);
  const pa = async (t, r) => {
      const o = r || p;
      if (!o) return;
      const u = H.find(X => X.id === o) || null;
      if (!u || !u.id) return;
      const v = u.tags || [],
        N = t.trim();
      if (!N || v.includes(N)) return;
      const Q = [...v, N];
      try {
        await ys.mutateAsync({
          conversationId: u.id,
          tags: Q
        }), C({
          title: "Tag adicionada",
          description: `A tag "${N}" foi adicionada com sucesso.`
        });
      } catch (X) {
        C({
          title: "Erro ao adicionar tag",
          description: X.message || "Ocorreu um erro.",
          variant: "destructive"
        });
      }
    },
    ha = async t => {
      if (c != null && c.id) try {
        await xa.mutateAsync({
          conversationId: c.id,
          enabled: t
        }), C({
          title: t ? "IA ativada" : "IA pausada",
          description: t ? "A IA volta a responder novas mensagens deste atendimento." : "Novas mensagens deste atendimento ficarão em modo manual."
        });
      } catch (r) {
        C({
          title: "Erro ao atualizar IA",
          description: r.message || "Tente novamente.",
          variant: "destructive"
        });
      }
    },
    Kr = async t => {
      if (!(!c || !j)) try {
        await ie.mutateAsync({
          conversationId: c.id,
          content: mr(t)
        }), await _s.mutateAsync({
          leadId: t.lead_id,
          propertyId: t.property_id,
          matchScore: t.match_score,
          notes: `Imovel enviado pelo atendimento em ${new Date().toISOString()}`
        }), C({
          title: "Imovel enviado",
          description: "A recomendacao foi enviada no WhatsApp e registrada no lead."
        });
      } catch (r) {
        C({
          title: "Erro ao enviar imovel",
          description: r.message || "Nao foi possivel enviar esta recomendacao.",
          variant: "destructive"
        });
      }
    },
    Cs = async (t, r) => {
      const o = r || p;
      if (!o) return;
      const u = H.find(Q => Q.id === o) || null;
      if (!u || !u.id) return;
      const N = (u.tags || []).filter(Q => Q !== t);
      try {
        await ys.mutateAsync({
          conversationId: u.id,
          tags: N
        }), C({
          title: "Tag removida",
          description: `A tag "${t}" foi removida com sucesso.`
        });
      } catch (Q) {
        C({
          title: "Erro ao remover tag",
          description: Q.message || "Ocorreu um erro.",
          variant: "destructive"
        });
      }
    },
    ks = () => {
      V.trim() && (pa(V.trim()), te(""));
    },
    Hr = t => {
      Ja(t), ve(!0);
    },
    Jr = async () => {
      if (Zt) try {
        await ma.mutateAsync(Zt), C({
          title: "Conversa excluída",
          description: "O atendimento foi excluído com sucesso."
        });
        const t = H.filter(r => r.id !== Zt);
        t.length > 0 ? h(t[0].id) : h(null), ve(!1), Ja(null);
      } catch (t) {
        C({
          title: "Erro ao excluir",
          description: t.message || "Ocorreu um erro ao excluir a conversa.",
          variant: "destructive"
        });
      }
    },
    Xr = t => {
      const r = H.find(o => o.id === t);
      h(t), ot(t), ea((r == null ? void 0 : r.agent_id) || "");
    },
    Yr = async () => {
      if (!it || !lt) {
        C({
          title: "Selecione um corretor",
          description: "Escolha quem vai assumir este atendimento.",
          variant: "destructive"
        });
        return;
      }
      Ya(!0);
      try {
        const t = H.find(N => N.id === it) || c || null,
          r = t ? ft(t) : null,
          o = t ? ws(t) : [],
          u = go(t, r, o);
        if (j != null && j.id) {
          const {
            error: N
          } = await B.from("messages").insert({
            conversation_id: it,
            sender_id: j.id,
            receiver_id: lt,
            content: u,
            message_type: "system",
            is_read: !1
          });
          if (N) throw N;
        }
        const {
          error: v
        } = await B.rpc("transfer_conversation", {
          p_conversation_id: it,
          p_to_agent_id: lt
        });
        if (v) throw v;
        C({
          title: "Atendimento transferido",
          description: "A conversa foi atribuída ao corretor selecionado."
        }), ot(null), ea(""), s.invalidateQueries({
          queryKey: ["conversations"]
        });
      } catch (t) {
        C({
          title: "Erro ao transferir",
          description: t.message || "Não foi possível transferir.",
          variant: "destructive"
        });
      } finally {
        Ya(!1);
      }
    },
    Zr = async () => {
      if (!(!c || !c.client_id)) {
        rs(!0);
        try {
          const t = as.trim(),
            {
              error: r
            } = await B.rpc("update_client_contact", {
              p_profile_id: c.client_id,
              p_name: ct,
              p_phone: t || null,
              p_email: aa.trim() || null,
              p_lead_id: c.lead_id || null
            });
          if (r) {
            console.warn("RPC update_client_contact falhou (ou não existe). Tentando update direto...", r);
            const {
              error: o
            } = await B.from("profiles").update({
              full_name: ct,
              email: aa.trim() || null,
              phone: t || null
            }).eq("id", c.client_id);
            if (o) throw new Error("Erro RLS/Perfil: " + o.message);
            const {
              error: u
            } = await B.from("whatsapp_contacts").update({
              name: ct,
              phone_number: t ? t.replace(/\D/g, "") : null
            }).eq("profile_id", c.client_id);
            if (u) throw new Error("Erro RLS/WhatsApp: " + u.message);
          }
          C({
            title: "Contato atualizado",
            description: "Os dados do contato foram salvos com sucesso."
          }), s.invalidateQueries({
            queryKey: ["conversations"]
          }), s.invalidateQueries({
            queryKey: ["messages", c.id]
          }), ta(!1);
        } catch (t) {
          C({
            title: "Erro ao salvar contato",
            description: t.message || "Ocorreu um erro.",
            variant: "destructive"
          });
        } finally {
          rs(!1);
        }
      }
    },
    Ke = H.filter(t => {
      var X, Z, ae, se, $, J, T, de, me, we;
      if (t.status === "deleted" || t.subject === "[deleted]") return !1;
      const r = t.whatsapp_contact && ((X = t.whatsapp_contact[0]) == null ? void 0 : X.is_group) || ((Z = t.client) == null ? void 0 : Z.is_group);
      if (pe && g !== "grupos" && r) return !1;
      const o = ((se = (ae = t.client) == null ? void 0 : ae.full_name) == null ? void 0 : se.toLowerCase()) || "",
        u = ((J = ($ = t.client) == null ? void 0 : $.phone) == null ? void 0 : J.toLowerCase()) || "",
        v = ((de = (T = t.client) == null ? void 0 : T.email) == null ? void 0 : de.toLowerCase()) || "",
        N = ((me = t.subject) == null ? void 0 : me.toLowerCase()) || "";
      if (!(!W || o.includes(W.toLowerCase()) || u.includes(W.toLowerCase()) || v.includes(W.toLowerCase()) || N.includes(W.toLowerCase())) || f !== "all" && ((we = ft(t)) == null ? void 0 : we.next_action) !== f) return !1;
      switch (g) {
        case "grupos":
          return r === !0;
        case "meus":
          return t.agent_id === (j == null ? void 0 : j.id) && t.status !== "pending" && t.status !== "closed" && !r;
        case "equipe":
          return Ge ? !1 : t.status !== "pending" && !r;
        case "nao-lidas":
          return (t.status === "pending" || (t.unread_count || 0) > 0) && !r;
        case "arquivadas":
          return t.status === "closed" && !r;
        default:
          return !0;
      }
    }).filter(t => !filtroCorretor || t.agent_id === filtroCorretor);
  i.useEffect(() => {
    if (!p && H.length > 0) {
      const t = O.state;
      if (t != null && t.leadToMessage && !ue && !K.current) {
        K.current = !0, ce(!0);
        return;
      }
      W ? Ke.length > 0 && h(Ke[0].id) : h(H[0].id);
    }
  }, [H, Ke, p, W, O.state, ue]), i.useEffect(() => {
    p && j != null && j.id && (Ur.mutate({
      conversationId: p,
      userId: j.id
    }), B.rpc("mark_conversation_read", {
      p_conversation_id: p
    }).then(() => {
      s.invalidateQueries({
        queryKey: ["conversations"]
      });
    }));
  }, [p, De.length]), i.useEffect(() => {
    const scrollDown = () => {
      if (y.current) {
        try {
          y.current.scrollIntoView({
            behavior: "auto",
            block: "end"
          });
        } catch {}
        const r = y.current.parentElement;
        if (r) r.scrollTop = r.scrollHeight + 99999;
      }
    };
    scrollDown();
    const t1 = setTimeout(scrollDown, 50),
      t2 = setTimeout(scrollDown, 200),
      t3 = setTimeout(scrollDown, 500);
    return () => {
      clearTimeout(t1), clearTimeout(t2), clearTimeout(t3);
    };
  }, [De, p]);
  const Ss = () => {
      var r;
      if (!R.trim() || !c || !j) return;
      let t = R.trim();
      Be && (t = `↳ *Respondendo a ${((r = Be.sender) == null ? void 0 : r.full_name) || "Cliente"}:* _"${Be.content.slice(0, 80)}"_

${t}`), ie.mutate({
        conversationId: c.id,
        content: t
      }, {
        onSuccess: () => {
          M(""), ca(null);
        },
        onError: o => C({
          title: "Erro ao enviar",
          description: o.message || "Tente novamente.",
          variant: "destructive"
        })
      });
    },
    en = t => {
      t.key === "Enter" && !t.shiftKey && (t.preventDefault(), Ss());
    },
    Lt = Tn(),
    fa = async t => {
      !c || !j || (await ie.mutateAsync({
        conversationId: c.id,
        content: t
      }));
    },
    As = () => {
      if (!c || !j) return;
      const t = new Date();
      t.setDate(t.getDate() + 1), Ve(t.toISOString().split("T")[0]), be("10:00"), Se(!0);
    },
    tn = async () => {
      var t, r;
      if (!(!c || !j || !Ae || !ge)) try {
        const o = new Date(`${Ae}T${ge}:00`);
        await qe.mutateAsync({
          agent_id: j.id,
          scheduled_at: o.toISOString(),
          status: "scheduled",
          notes: `Visita agendada via atendimento para ${((t = c.client) == null ? void 0 : t.full_name) || "cliente"}`,
          created_by: j.id
        });
        const u = o.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit"
        });
        await fa(`📅 Visita agendada para ${u} às ${ge}. Entraremos em contato para confirmar.`), C({
          title: "Visita agendada!",
          description: `Visita com ${((r = c.client) == null ? void 0 : r.full_name) || "cliente"} em ${u} às ${ge}.`
        }), Se(!1);
      } catch (o) {
        C({
          title: "Erro",
          description: o.message || "Erro ao agendar visita.",
          variant: "destructive"
        });
      }
    },
    an = async () => {
      var t;
      if (!(!c || !j)) try {
        await fa(`Olá ${((t = c.client) == null ? void 0 : t.full_name) || ""}! Segue a ficha cadastral para preenchimento. Por favor, preencha todos os campos e nos envie de volta o mais breve possível para darmos continuidade ao processo.`), C({
          title: "Ficha enviada!",
          description: "Mensagem com ficha cadastral enviada ao cliente."
        });
      } catch (r) {
        C({
          title: "Erro",
          description: r.message || "Erro ao enviar ficha.",
          variant: "destructive"
        });
      }
    },
    sn = async () => {
      var t;
      if (!(!c || !j)) try {
        await fa(`Olá ${((t = c.client) == null ? void 0 : t.full_name) || ""}! Para avançarmos no processo, precisamos dos seguintes documentos:

• RG e CPF
• Comprovante de renda (últimos 3 meses)
• Comprovante de endereço
• Certidão de estado civil

Por favor, envie as cópias digitalizadas por aqui ou pelo email.`), C({
          title: "Solicitação enviada!",
          description: "Mensagem de solicitação de documentos enviada."
        });
      } catch (r) {
        C({
          title: "Erro",
          description: r.message || "Erro ao solicitar docs.",
          variant: "destructive"
        });
      }
    },
    rn = () => {
      var t;
      c && (A("/propostas"), C({
        title: "Criar Proposta",
        description: `Redirecionando para criar proposta para ${((t = c.client) == null ? void 0 : t.full_name) || "cliente"}.`
      }));
    },
    ga = async t => {
      if (!c || !j) return;
      const r = 25 * 1024 * 1024;
      if (t.size > r) {
        C({
          title: "Arquivo muito grande",
          description: "O tamanho máximo é 25MB.",
          variant: "destructive"
        });
        return;
      }
      F(!0);
      try {
        const o = t.name.split(".").pop(),
          u = `${c.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${o}`,
          {
            error: v
          } = await B.storage.from("chat-attachments").upload(u, t);
        if (v) throw v;
        const {
            data: N
          } = B.storage.from("chat-attachments").getPublicUrl(u),
          Q = t.type.startsWith("image/"),
          X = t.type.startsWith("video/"),
          Z = t.type.startsWith("audio/"),
          ae = Q ? "[Imagem]" : X ? "[Video]" : Z ? "[Audio]" : "[Arquivo]";
        await ie.mutateAsync({
          conversationId: c.id,
          content: `${ae} ${t.name}
${N.publicUrl}`
        }), C({
          title: "Arquivo enviado!",
          description: `${t.name} enviado com sucesso.`
        });
      } catch (o) {
        C({
          title: "Erro ao enviar arquivo",
          description: o.message || "Tente novamente.",
          variant: "destructive"
        });
      } finally {
        F(!1);
      }
    },
    Es = async t => {
      var o;
      const r = (o = t.target.files) == null ? void 0 : o[0];
      r && (await ga(r), t.target.value = "");
    },
    nn = async () => {
      ra(!0);
      try {
        setTimeout(async () => {
          const t = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user"
            },
            audio: !1
          });
          xt.current = t, ut.current && (ut.current.srcObject = t);
        }, 300);
      } catch (t) {
        C({
          title: "Erro ao acessar câmera",
          description: t.message || "Verifique as permissões de acesso à câmera.",
          variant: "destructive"
        }), ra(!1);
      }
    },
    on = () => {
      if (!ut.current || !xt.current) return;
      const t = ut.current,
        r = document.createElement("canvas");
      r.width = t.videoWidth || 640, r.height = t.videoHeight || 480;
      const o = r.getContext("2d");
      o && (o.translate(r.width, 0), o.scale(-1, 1), o.drawImage(t, 0, 0, r.width, r.height), r.toBlob(u => {
        if (u) {
          const v = new File([u], `camera_photo_${Date.now()}.jpg`, {
            type: "image/jpeg"
          });
          ga(v);
        }
        ba();
      }, "image/jpeg", .9));
    },
    ba = () => {
      xt.current && (xt.current.getTracks().forEach(t => t.stop()), xt.current = null), ra(!1);
    },
    ln = async () => {
      try {
        const t = await navigator.mediaDevices.getUserMedia({
            audio: !0
          }),
          mime = MediaRecorder.isTypeSupported("audio/ogg;codecs=opus") ? "audio/ogg;codecs=opus" : MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm",
          r = new MediaRecorder(t, {
            mimeType: mime
          });
        je.current = r, qt.current = [], r.ondataavailable = o => {
          o.data.size > 0 && qt.current.push(o.data);
        }, r.start(200), oa(!0), la(0), ze.current && clearInterval(ze.current), ze.current = setInterval(() => {
          la(o => o + 1);
        }, 1e3);
      } catch {
        C({
          title: "Erro",
          description: "Não foi possível acessar o microfone. Verifique as permissões.",
          variant: "destructive"
        });
      }
    },
    cn = () => {
      je.current && zt && (je.current.onstop = null, je.current.stop(), je.current.stream.getTracks().forEach(t => t.stop())), ze.current && clearInterval(ze.current), oa(!1), la(0), qt.current = [];
    },
    dn = () => {
      je.current && zt && (je.current.onstop = async () => {
        var o;
        const t = new Blob(qt.current);
        oa(!1), ze.current && clearInterval(ze.current), (o = je.current) == null || o.stream.getTracks().forEach(u => u.stop());
        const mtype = je.current && je.current.mimeType || "audio/webm",
          ext = mtype.includes("ogg") ? "ogg" : "webm",
          realMime = mtype.includes("ogg") ? "audio/ogg" : "audio/webm",
          r = new File([t], `audio_${Date.now()}.${ext}`, {
            type: realMime
          });
        await ga(r);
      }, je.current.stop());
    },
    mn = t => {
      const r = Math.floor(t / 60),
        o = t % 60;
      return `${r}:${o.toString().padStart(2, "0")}`;
    },
    un = () => {
      if (!(!c || !j)) {
        if (!navigator.geolocation) {
          C({
            title: "Geolocalização não suportada",
            description: "Seu navegador não suporta geolocalização.",
            variant: "destructive"
          });
          return;
        }
        navigator.geolocation.getCurrentPosition(async t => {
          const {
              latitude: r,
              longitude: o
            } = t.coords,
            v = `📍 Localização Enviada:
${`https://maps.google.com/?q=${r},${o}`}`;
          try {
            await ie.mutateAsync({
              conversationId: c.id,
              content: v
            }), C({
              title: "Localização enviada!",
              description: "Sua localização foi compartilhada no chat."
            });
          } catch (N) {
            C({
              title: "Erro ao enviar localização",
              description: N.message || "Tente novamente.",
              variant: "destructive"
            });
          }
        }, t => {
          C({
            title: "Erro de geolocalização",
            description: t.message || "Não foi possível obter sua localização.",
            variant: "destructive"
          });
        });
      }
    },
    xn = () => {
      Et(""), Pt(""), $t(""), Rt(""), mt(!0);
    },
    pn = async () => {
      if (!c || !j || !At.trim() || !It.trim()) return;
      const t = `👤 Contato Compartilhado:
• Nome: ${At.trim()}
• WhatsApp: ${It.trim()}${na.trim() ? `
• E-mail: ${na.trim()}` : ""}${ia.trim() ? `
• Empresa: ${ia.trim()}` : ""}`;
      try {
        await ie.mutateAsync({
          conversationId: c.id,
          content: t
        }), C({
          title: "Contato enviado!",
          description: "O contato foi compartilhado no chat."
        }), mt(!1), Et(""), Pt(""), $t(""), Rt("");
      } catch (r) {
        C({
          title: "Erro ao enviar contato",
          description: r.message || "Tente novamente.",
          variant: "destructive"
        });
      }
    },
    hn = async t => {
      var r, o;
      try {
        let u = t.lead_id;
        u || (u = (await fs.mutateAsync({
          name: t.contact_name,
          phone: t.contact_phone || null,
          email: t.contact_email || null,
          stage: "Primeiro Atendimento",
          source: t.channel === "whatsapp" ? "WhatsApp" : t.channel === "phone" || t.channel === "email" ? "Outros" : "Site",
          interest: t.type || null,
          notes: `[${(r = t.priority) == null ? void 0 : r.toUpperCase()}] ${t.subject}
${t.description}`,
          responsible_id: (j == null ? void 0 : j.id) || null,
          created_by: (j == null ? void 0 : j.id) || null
        })).id);
        let v = null;
        if (t.contact_phone) {
          const {
            data: N
          } = await B.from("profiles").select("id").eq("phone", t.contact_phone).maybeSingle();
          N && (v = N.id);
        }
        if (!v && t.contact_email) {
          const {
            data: N
          } = await B.from("profiles").select("id").eq("email", t.contact_email).eq("role", "client").maybeSingle();
          N && (v = N.id);
        }
        if (!v) {
          const {
            data: N,
            error: Q
          } = await B.rpc("create_client_profile", {
            p_name: t.contact_name,
            p_phone: t.contact_phone || null,
            p_email: t.contact_email || null
          });
          if (Q) throw Q;
          v = N;
        }
        if (v && j) {
          const N = await Lt.mutateAsync({
            client_id: v,
            agent_id: j.id,
            subject: t.subject || `Atendimento - ${t.contact_name}`
          });
          (o = t.description) != null && o.trim() && N != null && N.id && (await ie.mutateAsync({
            conversationId: N.id,
            content: t.description.trim()
          })), N != null && N.id && h(N.id);
        }
        C({
          title: "Atendimento Criado",
          description: `Conversa com ${t.contact_name} aberta com sucesso.`
        });
      } catch (u) {
        C({
          title: "Erro ao criar atendimento",
          description: u.message || "Tente novamente.",
          variant: "destructive"
        });
      }
    };
  i.useEffect(() => {
    const t = r => {
      r.detail && Ps(r.detail.profileId, r.detail.phone, r.detail.name);
    };
    return window.addEventListener("openPrivateChat", t), () => window.removeEventListener("openPrivateChat", t);
  }, [H, j]);
  const Is = t => t ? t.includes("@") ? t.replace(/:\d+@/, "@") : `${t.replace(/\D/g, "")}@s.whatsapp.net` : "",
    Ps = async (t, r, o) => {
      var J;
      const u = Is(r),
        v = r.replace(/\D/g, "");
      let N = v,
        Q = t,
        X = u;
      const {
        data: Z
      } = await B.from("whatsapp_contacts").select("phone_number, profile_id").or(`remote_jid_alt.eq.${v}@lid,remote_jid_alt.eq.${u},remote_jid.eq.${u},phone_number.eq.${v}`).not("phone_number", "is", null).limit(2);
      let ae = Z == null ? void 0 : Z[0];
      Z && Z.length > 1 && (ae = Z.find(T => T.phone_number !== v) || Z[0]), ae && ae.phone_number && (N = ae.phone_number, Q = ae.profile_id || t, X = Is(N));
      const se = N,
        $ = H.find(T => {
          var de;
          return T.client_id === Q && !(T.whatsapp_contact && ((de = T.whatsapp_contact[0]) == null ? void 0 : de.is_group) === !0);
        });
      if ($) w("meus"), h($.id), C({
        title: "Conversa selecionada",
        description: `Abrindo conversa privada com ${o || se}.`
      }), B.from("whatsapp_contacts").update({
        remote_jid: X
      }).eq("conversation_id", $.id).then();else try {
        C({
          title: "Iniciando atendimento...",
          description: "Criando ficha do contato..."
        });
        let T = null;
        const {
          data: de
        } = await B.from("leads").select("id").eq("phone", se).maybeSingle();
        de ? T = de.id : T = (await fs.mutateAsync({
          name: o || `Cliente ${se.slice(-4)}`,
          phone: se,
          stage: "Primeiro Atendimento",
          source: "WhatsApp",
          notes: `Lead criado via grupo a partir de ${((J = c == null ? void 0 : c.client) == null ? void 0 : J.full_name) || "grupo"}.`,
          responsible_id: (j == null ? void 0 : j.id) || null,
          created_by: (j == null ? void 0 : j.id) || null
        })).id;
        const {
            data: me
          } = await B.from("whatsapp_contacts").select("id").eq("phone_number", se).eq("is_group", !1).maybeSingle(),
          we = await Lt.mutateAsync({
            client_id: t,
            agent_id: (j == null ? void 0 : j.id) || null,
            subject: `WhatsApp - ${o || r}`
          });
        we != null && we.id && (me ? await B.from("whatsapp_contacts").update({
          conversation_id: we.id,
          remote_jid: X,
          updated_at: new Date().toISOString()
        }).eq("id", me.id) : await B.from("whatsapp_contacts").insert({
          tenant_id: c == null ? void 0 : c.tenant_id,
          profile_id: t,
          conversation_id: we.id,
          phone_number: se,
          remote_jid: X,
          name: o || `Cliente ${se.slice(-4)}`,
          is_group: !1,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }), w("meus"), h(we.id), C({
          title: "Atendimento iniciado",
          description: "Conversa privada iniciada com sucesso."
        }));
      } catch (T) {
        C({
          title: "Erro ao iniciar conversa",
          description: T.message || "Tente novamente.",
          variant: "destructive"
        });
      }
    },
    fn = async () => {
      if (!dt.trim() || !St.trim()) {
        C({
          title: "Campos obrigatórios",
          description: "Por favor, informe o nome e o telefone.",
          variant: "destructive"
        });
        return;
      }
      ds(!0);
      try {
        const {
          data: t,
          error: r
        } = await B.rpc("create_client_profile", {
          p_name: dt.trim(),
          p_phone: St.trim(),
          p_email: os.trim() || null
        });
        if (r) throw r;
        if (t && j) {
          const o = await Lt.mutateAsync({
            client_id: t,
            agent_id: j.id,
            subject: `Conversa com ${dt.trim()}`
          });
          ns(""), is(""), ls(""), Qe(!1), o != null && o.id && h(o.id), C({
            title: "Contato Adicionado",
            description: "Contato e canal de atendimento criados com sucesso!"
          });
        }
      } catch (t) {
        C({
          title: "Erro ao adicionar contato",
          description: t.message || "Ocorreu um erro.",
          variant: "destructive"
        });
      } finally {
        ds(!1);
      }
    },
    va = t => {
      if (!t) return "";
      const r = new Date(t),
        v = (new Date().getTime() - r.getTime()) / (1e3 * 60 * 60);
      return v < 24 ? r.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      }) : v < 48 ? "Ontem" : r.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit"
      });
    },
    Me = t => t ? t.split(" ").map(r => r[0]).join("").slice(0, 2).toUpperCase() : "?",
    gn = t => {
      if (!t) return "Não informado";
      const r = t.replace(/\D/g, "");
      if (!r) return t;
      if (r.length === 15) return "Não informado";
      if (r.length === 13 && r.startsWith("55")) {
        const o = r.substring(2, 4),
          u = r.substring(4, 9),
          v = r.substring(9);
        return `+55 (${o}) ${u}-${v}`;
      }
      if (r.length === 12 && r.startsWith("55")) {
        const o = r.substring(2, 4),
          u = r.substring(4, 8),
          v = r.substring(8);
        return `+55 (${o}) ${u}-${v}`;
      }
      if (r.length === 11 && /^[1-9][1-9]9/.test(r)) {
        const o = r.substring(0, 2),
          u = r.substring(2, 7),
          v = r.substring(7);
        return `+55 (${o}) ${u}-${v}`;
      }
      if (r.length === 10) {
        const o = r.substring(0, 2),
          u = r.substring(2, 6),
          v = r.substring(6);
        return `(${o}) ${u}-${v}`;
      }
      return t;
    },
    bn = t => !t || t.replace(/\D/g, "").length === 15 ? "" : t,
    vn = t => {
      switch (t) {
        case "connected":
          return "bg-emerald-500";
        case "connecting":
        case "qr_ready":
          return "bg-amber-500";
        case "error":
          return "bg-red-500";
        default:
          return "bg-slate-400";
      }
    };
  return <div className="h-[100dvh] bg-background overflow-hidden flex flex-col"><AudioFailSafeModal /><fi activeModule="atendimento" onModuleChange={() => {}} collapsed={a} onCollapsedChange={l} /><gi activeModule="atendimento" onModuleChange={() => {}} open={n} onOpenChange={d} /><div className={q("flex flex-col h-full transition-all duration-300", a ? "lg:pl-[72px]" : "lg:pl-64")}><bi title="Central de Atendimento" subtitle="Comunicação com clientes em tempo real" actionButton={<div className="flex items-center gap-2">{(G == null ? void 0 : G.role) === "admin" && (G == null ? void 0 : G.email) !== "jota@imobiliaria.com" && <m variant="outline" size="icon" className="relative" onClick={() => $e(!0)} title="Configurações WhatsApp"><Ca className="h-4 w-4" />{!js && <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background ${vn(Ue == null ? void 0 : Ue.status)}`} />}</m>}<m variant="outline" className="gap-2 border-accent text-accent hover:bg-accent/5 hover:text-accent" onClick={() => Qe(!0)}><Bt className="h-4 w-4" />Adicionar Contato</m><m variant="outline" className="gap-2" onClick={() => hs(!0)}><Hn className="h-4 w-4" />Importar</m><m variant="cta" className="gap-2" onClick={() => ce(!0)}><Wt className="h-4 w-4" />Novo Atendimento</m></div>} onMobileMenuClick={() => d(!0)} /><main className="flex-1 flex flex-col p-0 lg:p-0 min-h-0">{js ? <div className="flex items-center justify-center h-[calc(100vh-73px)]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div> : (Ue == null ? void 0 : Ue.status) !== "connected" ? (G == null ? void 0 : G.role) !== "admin" ? <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background"><div className="max-w-md p-8 rounded-2xl border border-border bg-card shadow-lg space-y-4"><div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Wa className="h-6 w-6" /></div><h3 className="text-lg font-semibold text-foreground">WhatsApp Desconectado</h3><p className="text-sm text-muted-foreground">O WhatsApp central da imobiliária está temporariamente desconectado. Por favor, entre em contato com o administrador para restabelecer a conexão.</p></div></div> : <so /> : <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden"><div className={q("relative w-full lg:w-[35%] min-w-[320px] max-w-[420px] shrink-0 border-r border-border bg-card flex-col", c ? "hidden lg:flex" : "flex")}><div className="p-4 border-b border-border space-y-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><h3 className="font-semibold text-foreground">Conversas</h3><m type="button" variant="ghost" size="icon" onClick={() => x(!pe)} title={pe ? "Mostrar Grupos" : "Ocultar Grupos"} className={q("h-7 w-7 rounded-lg transition-all", pe ? "text-muted-foreground opacity-60 hover:opacity-100 hover:bg-muted/50" : "text-accent bg-accent/10 hover:bg-accent/20")}><Le className="h-4 w-4" /></m></div><span className="text-xs text-muted-foreground">{Ke.length}/{Mt}</span></div><div className="relative"><Ma className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><input type="text" placeholder="Buscar cliente..." value={W} onChange={t => b(t.target.value)} className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></div><div className={q("grid gap-1", Ge ? "grid-cols-[1fr_1fr_1.2fr_38px]" : "grid-cols-[1fr_1fr_1fr_1.2fr_38px]")}><m variant={g === "meus" ? "cta" : "ghost"} size="sm" onClick={() => w("meus")} className="min-w-0 text-xs relative px-2 gap-1"><Jn className="h-3 w-3 shrink-0" />Meus{(() => {
                    const t = H.filter(r => {
                      var o, u;
                      return r.status !== "deleted" && r.subject !== "[deleted]" && r.status !== "pending" && r.status !== "closed" && ((o = r.client) == null ? void 0 : o.is_group) !== !0 && !(r.whatsapp_contact && ((u = r.whatsapp_contact[0]) == null ? void 0 : u.is_group) === !0) && ((G == null ? void 0 : G.role) === "admin" || (G == null ? void 0 : G.role) === "manager" ? !0 : r.agent_id === (j == null ? void 0 : j.id));
                    }).length;
                    return t > 0 ? <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">{t}</span> : null;
                  })()}</m>{!Ge && <m variant={g === "equipe" ? "cta" : "ghost"} size="sm" onClick={() => w("equipe")} className="min-w-0 text-xs px-2 gap-1"><Le className="h-3 w-3 shrink-0" />Equipe</m>}<m variant={g === "grupos" ? "cta" : "ghost"} size="sm" onClick={() => w("grupos")} className="min-w-0 text-xs relative px-2 gap-1"><Le className="h-3 w-3 shrink-0" />Grupos{(() => {
                    const t = H.filter(r => {
                      var u, v;
                      return (r.whatsapp_contact && ((u = r.whatsapp_contact[0]) == null ? void 0 : u.is_group) || ((v = r.client) == null ? void 0 : v.is_group)) && (r.unread_count || 0) > 0;
                    }).length;
                    return t > 0 ? <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">{t}</span> : null;
                  })()}</m><m variant={g === "nao-lidas" ? "cta" : "ghost"} size="sm" onClick={() => w("nao-lidas")} className="min-w-0 text-xs relative px-2 gap-1"><ar className="h-3 w-3 shrink-0" />Não lidas{(() => {
                    const t = H.filter(r => {
                      var o, u;
                      return r.status !== "deleted" && r.subject !== "[deleted]" && ((o = r.client) == null ? void 0 : o.is_group) !== !0 && !(r.whatsapp_contact && ((u = r.whatsapp_contact[0]) == null ? void 0 : u.is_group) === !0) && (r.status === "pending" || (r.unread_count || 0) > 0);
                    }).length;
                    return t > 0 ? <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{t}</span> : null;
                  })()}</m><m variant={g === "arquivadas" ? "cta" : "ghost"} size="sm" onClick={() => w("arquivadas")} className="min-w-0 px-0" title="Arquivadas"><Xn className="h-4 w-4" /><span className="sr-only">Arquivadas</span></m></div><He><Je asChild={!0}><m variant={f === "all" ? "outline" : "secondary"} size="sm" className="h-8 w-full justify-between gap-2 text-xs"><span className="flex items-center gap-2 min-w-0"><Yn className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{f === "all" ? "Todas as próximas ações" : at(f)}</span></span>{f === "all" ? <U variant="outline" className="h-5 px-1.5 text-[10px]">{Object.values(da).reduce((t, r) => t + r, 0)}</U> : <xe className="h-3.5 w-3.5 text-muted-foreground" onClick={t => {
                      t.stopPropagation(), S("all");
                    }} />}</m></Je><Xe align="start" className="w-64"><Pa>Próxima ação</Pa><Y onClick={() => S("all")}>Todas</Y><Vt />{["agendar_visita", "confirmar_visita", "match_pronto", "enviar_opcoes", "indicar_imovel", "follow_up_atrasado", "qualificar_lead", "buscar_imoveis", "priorizar_corretor", "ia_pausada", "retomar_ia", "acompanhar"].map(t => <Y onClick={() => S(t)} className="gap-2"><span className={q("h-2 w-2 rounded-full border", Qt(t))} /><span className="flex-1">{at(t)}</span>{(da[t] || 0) > 0 && <U variant="outline" className="h-5 px-1.5 text-[10px]">{da[t]}</U>}</Y>)}</Xe></He>{(!Ge || (G == null ? void 0 : G.role) === "admin" || (G == null ? void 0 : G.role) === "gestor") && (Tt == null ? void 0 : Tt.length) > 0 && <select value={filtroCorretor} onChange={t => setFiltroCorretor(t.target.value)} className="h-8 px-2 text-xs rounded-md border border-input bg-background text-foreground outline-none w-full mt-1.5 truncate cursor-pointer" title="Filtrar por Atendente"><option value="">Todos os atendentes</option>{(Tt || []).map(t => <option value={t.id}>{t.full_name || t.email || t.id}</option>)}</select>}</div><div className="flex-1 overflow-y-auto pb-20">{gs && <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>}{!gs && Ke.length === 0 && <div className="m-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-center text-muted-foreground"><he className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm font-medium text-foreground">{W ? "Nenhuma conversa encontrada" : Mt === 0 ? "Aguardando primeira mensagem" : "Nada neste filtro"}</p><p className="mt-1 text-xs">{W ? "Tente outro nome, telefone ou limpe a busca." : Mt === 0 ? "As novas conversas aparecem aqui automaticamente." : "Troque de filtro para ver outros atendimentos."}</p>{(W || Mt > 0) && <m variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={() => {
                  b(""), S("all"), w("meus");
                }}>Limpar filtros</m>}</div>}{Ke.map(t => {
                var Q, X, Z, ae, se;
                const P_isAdmin = (G == null ? void 0 : G.role) !== "agent",
                  P_ag_obj = t.agent || t.assigned_agent,
                  P_ag_name = P_ag_obj && (P_ag_obj.full_name || P_ag_obj.name) || t.agent_name || t.assigned_agent_name,
                  P_admin_sub = P_ag_name ? `Conversa com ${P_ag_name}` : "Atendente não atribuído",
                  r = ((Q = t.client) == null ? void 0 : Q.full_name) || "Cliente",
                  o = De.length > 0 && t.id === p ? (X = De[De.length - 1]) == null ? void 0 : X.content : t.subject,
                  P_sub = P_isAdmin ? P_admin_sub : o || "Nova conversa",
                  u = (t.tags || []).slice(0, 2),
                  v = Math.max((t.tags || []).length - u.length, 0),
                  N = ft(t);
                return <div onClick={() => {
                  var J, T;
                  h(t.id), t.whatsapp_contact && ((J = t.whatsapp_contact[0]) == null ? void 0 : J.is_group) || ((T = t.client) == null ? void 0 : T.is_group) ? ja.getState().openPanel(t.id) : ja.getState().closePanel();
                }} className={q("group p-3 border-b border-border cursor-pointer transition-colors hover:bg-muted/50", p === t.id && "bg-accent/5 border-l-2 border-l-accent")}><div className="flex items-start gap-2.5"><_e className="h-9 w-9">{(Z = t.client) != null && Z.avatar_url ? <Ce src={t.client.avatar_url} alt={r} /> : null}<ke className="bg-primary text-primary-foreground">{Me(r)}</ke></_e><div className="flex-1 min-w-0"><div className="flex items-center justify-between"><span className="font-medium text-foreground truncate flex items-center gap-1">{r}{(t.whatsapp_contact && ((ae = t.whatsapp_contact[0]) == null ? void 0 : ae.is_group) || ((se = t.client) == null ? void 0 : se.is_group)) && <Le className="h-3 w-3 text-muted-foreground shrink-0" title="Grupo" />}</span><div className="flex items-center gap-1.5">{(t.unread_count || 0) > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold text-white shadow-sm" title={`${t.unread_count} mensagem(ns) não lida(s)`}>{t.unread_count}</span>}{t.status === "pending" && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-[11px] font-bold shadow-sm" title="Aguardando atendimento">!</span>}<span className="text-xs text-muted-foreground">{va(t.last_message_at)}</span></div></div><p className="text-xs text-muted-foreground truncate mt-0.5">{P_sub}</p>{t.status === "pending" && <div className="flex gap-1 mt-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"><m size="sm" variant="outline" className="h-7 w-7 p-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200" title="Aceitar atendimento" onClick={async $ => {
                          $.stopPropagation();
                          const {
                            error: J
                          } = await B.rpc("accept_conversation", {
                            p_conversation_id: t.id
                          });
                          J ? C({
                            title: "Erro ao aceitar",
                            description: J.message,
                            variant: "destructive"
                          }) : (C({
                            title: "Atendimento aceito"
                          }), s.invalidateQueries({
                            queryKey: ["conversations"]
                          }));
                        }}><ur className="h-3 w-3 shrink-0" /><span className="sr-only">Aceitar</span></m><m size="sm" variant="outline" className="h-7 w-7 p-0 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" title="Transferir atendimento" onClick={$ => {
                          $.stopPropagation(), Xr(t.id);
                        }}><sr className="h-3 w-3 shrink-0" /><span className="sr-only">Transferir</span></m><m size="sm" variant="outline" className="h-7 w-7 p-0 bg-red-50 hover:bg-red-100 text-red-700 border-red-200" title="Ignorar atendimento" onClick={async $ => {
                          $.stopPropagation();
                          const {
                            error: J
                          } = await B.rpc("ignore_conversation", {
                            p_conversation_id: t.id
                          });
                          J ? C({
                            title: "Erro ao ignorar",
                            description: J.message,
                            variant: "destructive"
                          }) : (C({
                            title: "Conversa ignorada"
                          }), s.invalidateQueries({
                            queryKey: ["conversations"]
                          }));
                        }}><xe className="h-3 w-3 shrink-0" /><span className="sr-only">Ignorar</span></m></div>}<div className="flex items-center gap-1 mt-1.5 flex-wrap"><U variant="outline" className="text-[10px] h-5 px-1.5">{t.status === "open" ? "Aberta" : t.status === "pending" ? "Pendente" : t.status === "waiting" ? "Aguardando" : "Fechada"}</U><U variant={t.ai_enabled === !1 ? "outline" : "secondary"} className={q("text-[10px] h-5 px-1.5", t.ai_enabled === !1 && "border-amber-200 bg-amber-50 text-amber-700")}>{t.ai_enabled === !1 ? "IA pausada" : "IA ativa"}</U>{(N == null ? void 0 : N.next_action) && N.next_action !== "sem_acao" && <U variant="outline" className={q("text-[10px] h-5 px-1.5 border", Qt(N.next_action))} title={(N.missing_fields || []).map(jt).join(", ")}>{at(N.next_action)}{(N.missing_count || 0) > 0 && <span className="ml-1 font-semibold">+{N.missing_count}</span>}</U>}{u.map($ => <U className={q("text-[10px] h-5 px-1.5 font-medium border", Ye($))}>{$}</U>)}{v > 0 && <U variant="outline" className="text-[10px] h-5 px-1.5">+{v}</U>}<Gt><Ut asChild={!0} onClick={$ => $.stopPropagation()}><button type="button" className="inline-flex items-center justify-center rounded-full border border-dashed border-input bg-transparent text-[10px] h-5 px-1 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"><Wt className="h-2.5 w-2.5" /></button></Ut><Kt align="start" className="w-52 p-2.5 space-y-2.5 bg-card border border-border rounded-xl shadow-lg" onClick={$ => $.stopPropagation()}><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider p-0">Tags da Conversa</p><div className="flex flex-wrap gap-1">{t.tags && t.tags.length > 0 ? t.tags.map($ => <U className={q("text-[9px] font-medium border flex items-center gap-1 pl-1.5 pr-0.5 py-0.2", Ye($))}>{$}<button onClick={J => {
                                  J.stopPropagation(), Cs($, t.id);
                                }} className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors focus:outline-none"><span className="text-[8px] font-semibold leading-none">×</span></button></U>) : <span className="text-[10px] text-muted-foreground italic">Sem tags</span>}</div><hr className="border-border opacity-50" /><div className="space-y-1"><p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Sugestões</p><div className="flex flex-wrap gap-1">{["Quente", "Frio", "Visita", "Negociação", "Pendente"].map($ => {
                                  var T;
                                  return ((T = t.tags) == null ? void 0 : T.includes($)) ? null : <m variant="outline" size="sm" onClick={de => {
                                    de.stopPropagation(), pa($, t.id);
                                  }} className={q("text-[9px] h-5 px-1.5 py-0 font-medium", Ye($))}>+ {$}</m>;
                                })}</div></div></Kt></Gt></div></div></div></div>;
              })}</div><div className="pointer-events-none absolute bottom-4 right-4 z-20"><He><Je asChild={!0}><m type="button" variant="cta" size="icon" className="pointer-events-auto h-12 w-12 rounded-full shadow-lg shadow-accent/25" title="Ações rápidas"><Wt className="h-5 w-5" /></m></Je><Xe align="end" side="top" className="w-64 p-1.5"><Pa>Ações rápidas</Pa><Vt /><Y className="gap-3 py-2.5" onClick={() => ce(!0)}><Oe className="h-4 w-4 text-accent" /><div className="min-w-0"><p className="text-sm font-medium">Chamar novo contato</p><p className="text-xs text-muted-foreground">Abrir conversa e enviar mensagem</p></div></Y><Y className="gap-3 py-2.5" onClick={() => Qe(!0)}><Bt className="h-4 w-4 text-accent" /><div className="min-w-0"><p className="text-sm font-medium">Adicionar novo contato</p><p className="text-xs text-muted-foreground">Criar contato e conversa</p></div></Y><Y className="gap-3 py-2.5" disabled={!c} onClick={xn}><Ze className="h-4 w-4 text-accent" /><div className="min-w-0"><p className="text-sm font-medium">Enviar contato</p><p className="text-xs text-muted-foreground">Compartilhar no chat atual</p></div></Y>{(G == null ? void 0 : G.role) === "admin" && <e.Fragment><Vt /><Y className="gap-3 py-2.5" onClick={() => $e(!0)}><Ca className="h-4 w-4 text-accent" /><div className="min-w-0"><p className="text-sm font-medium">Conexão WhatsApp</p><p className="text-xs text-muted-foreground">Status e configurações</p></div></Y></e.Fragment>}</Xe></He></div></div><div className={q("flex-1 min-w-0 flex-col bg-background", c ? "flex" : "hidden lg:flex")}>{c ? <e.Fragment><div className="flex items-center justify-between gap-3 p-4 border-b border-border bg-card min-w-0"><div className="flex items-center gap-3 min-w-0"><m variant="ghost" size="icon" className="lg:hidden shrink-0 -ml-2 mr-1" onClick={() => h(null)}><Zn className="h-5 w-5" /></m><_e className="h-10 w-10">{($s = c.client) != null && $s.avatar_url ? <Ce src={c.client.avatar_url} alt={((Rs = c.client) == null ? void 0 : Rs.full_name) || "Cliente"} /> : null}<ke className="bg-primary text-primary-foreground">{Me((zs = c.client) == null ? void 0 : zs.full_name)}</ke></_e><div className="min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-foreground truncate">{((qs = c.client) == null ? void 0 : qs.full_name) || "Cliente"}</span>{c.tags && c.tags.map(t => <U className={q("text-[10px] h-5 px-1.5 font-medium border", Ye(t))}>{t}</U>)}<Gt><Ut asChild={!0}><button type="button" className="inline-flex items-center justify-center rounded-full border border-dashed border-input bg-transparent text-[10px] h-5 px-1.5 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex items-center gap-1"><Wt className="h-2.5 w-2.5" /> Tag</button></Ut><Kt align="start" className="w-56 p-3 space-y-3 bg-card border border-border rounded-xl shadow-lg"><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider p-0">Gerenciar Tags</p><div className="flex flex-wrap gap-1.5">{c.tags && c.tags.length > 0 ? c.tags.map(t => <U className={q("text-[10px] font-medium border flex items-center gap-1 pl-2 pr-1 py-0.5", Ye(t))}>{t}<button onClick={r => {
                                r.stopPropagation(), Cs(t);
                              }} className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors focus:outline-none"><span className="text-[9px] font-semibold leading-none">×</span></button></U>) : <span className="text-[11px] text-muted-foreground italic">Sem tags associadas</span>}</div><hr className="border-border opacity-50" /><div className="space-y-1"><p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Sugestões Rápidas</p><div className="flex flex-wrap gap-1">{["Quente", "Frio", "Visita", "Negociação", "Pendente"].map(t => {
                                var o;
                                return ((o = c.tags) == null ? void 0 : o.includes(t)) ? null : <m variant="outline" size="sm" onClick={() => pa(t)} className={q("text-[10px] h-6 px-2 py-0 font-medium", Ye(t))}>+ {t}</m>;
                              })}</div></div><hr className="border-border opacity-50" /><div className="flex gap-1.5"><input type="text" placeholder="Nova tag..." value={V} onChange={t => te(t.target.value)} onKeyDown={t => {
                              t.key === "Enter" && (t.preventDefault(), ks());
                            }} className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent" /><m size="sm" variant="cta" onClick={ks} className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium px-2 rounded-lg">Add</m></div></Kt></Gt></div><div className="mt-0.5 flex items-center gap-2 min-w-0"><p className="text-sm text-muted-foreground truncate">{c.subject || "Conversa"}</p>{(L == null ? void 0 : L.next_action) && L.next_action !== "sem_acao" && <U variant="outline" className={q("h-5 shrink-0 border px-1.5 text-[10px]", Qt(L.next_action))} title={(L.missing_fields || []).map(jt).join(", ")}>{at(L.next_action)}</U>}</div></div></div><div className="flex items-center gap-2 shrink-0"><div className={q("hidden sm:flex items-center gap-2 rounded-lg border px-2.5 py-1.5", Ne ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")} title={Ne ? "IA ativa neste atendimento" : "IA pausada neste atendimento"}><Nt className="h-3.5 w-3.5" /><span className="text-xs font-semibold">{Ne ? "IA" : "Manual"}</span><Ht checked={Ne} onCheckedChange={ha} disabled={xa.isPending} aria-label="Ativar ou pausar IA neste atendimento" className="h-5 w-9 data-[state=checked]:bg-emerald-500" /></div>{((Ds = c.client) == null ? void 0 : Ds.phone) && <m variant="ghost" size="icon" title={c.client.phone}><Oe className="h-4 w-4" /></m>}{((Ts = c.client) == null ? void 0 : Ts.email) && <m variant="ghost" size="icon" title={c.client.email}><ka className="h-4 w-4" /></m>}<m variant={Fe ? "secondary" : "ghost"} size="icon" onClick={() => kt(t => !t)} title={Fe ? "Ocultar dados do contato" : "Mostrar dados do contato"}><Ze className="h-4 w-4" /></m>{(c.whatsapp_contact && ((Ms = c.whatsapp_contact[0]) == null ? void 0 : Ms.is_group) || ((Ls = c.client) == null ? void 0 : Ls.is_group)) && <m variant="cta" size="sm" onClick={() => console.log("Panel disabled in favor of right sidebar")} title="Abrir Painel do Grupo" className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-md flex items-center gap-2 rounded-full px-4 ml-2"><Le className="h-4 w-4" /><span className="hidden md:inline">Painel de Grupo</span></m>}<m variant="ghost" size="icon" onClick={() => Re(!0)} title="Configurações do Atendimento"><Ca className="h-4 w-4" /></m><He><Je asChild={!0}><m variant="ghost" size="icon"><ei className="h-4 w-4" /></m></Je><Xe align="end"><Y onClick={() => ha(!Ne)} className="cursor-pointer">{Ne ? "Pausar IA" : "Ativar IA"}</Y><Y onClick={() => {
                        c && Hr(c.id);
                      }} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">Excluir Conversa</Y></Xe></He></div></div><div className="flex-1 overflow-y-auto p-4 space-y-4">{De.length === 0 && <div className="text-center py-12 text-muted-foreground"><he className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Nenhuma mensagem. Inicie a conversa!</p></div>}{De.map(t => {
                  var u, v, N, Q, X, Z, ae, se, $, J;
                  const P_cid = (c == null ? void 0 : c.client_id) || ((Q = c == null ? void 0 : c.whatsapp_contact) == null ? void 0 : Q[0]?.id) || ((X = c == null ? void 0 : c.client) == null ? void 0 : X.id);
                  const r = t.from_me === !0 || t.from_me === 1 || t.from_me === "true" || t.direction === "outbound" || t.direction === "sent" || t.direction === "outgoing" || t.key_from_me === !0 || t.key_from_me === 1 || t.sender_id === (j == null ? void 0 : j.id);
                  const P_name = t.sender && (t.sender.full_name || t.sender.name) || t.sender_name || (t.sender_id === (j == null ? void 0 : j.id) ? (G == null ? void 0 : G.full_name) || "Você" : null) || ((Z = c == null ? void 0 : c.assigned_agent) == null ? void 0 : Z.full_name) || ((ae = c == null ? void 0 : c.agent) == null ? void 0 : ae.full_name) || "Atendente não atribuído";
                  const P_dept = t.sender && (t.sender.department || t.sender.sector || t.sender.team || (t.sender.role === "admin" ? "Administração" : t.sender.role !== "client" ? "Atendimento" : null)) || (Z = c == null ? void 0 : c.assigned_agent) && (Z.department || Z.sector || (Z.role === "admin" ? "Administração" : Z.role !== "client" ? "Atendimento" : null)) || (ae = c == null ? void 0 : c.agent) && (ae.department || ae.sector || (ae.role === "admin" ? "Administração" : ae.role !== "client" ? "Atendimento" : null)) || (t.sender_id === (j == null ? void 0 : j.id) ? (G == null ? void 0 : G.department) || ((G == null ? void 0 : G.role) === "admin" ? "Administração" : (G == null ? void 0 : G.role) !== "client" ? "Atendimento" : "Comercial") : null) || "Atendimento";
                  const P_hdr = P_name === "Atendente não atribuído" ? P_name : P_name + (P_dept ? " - " + P_dept : "");
                  const o = t.message_type === "system";
                  return <div className={q("flex relative group mb-6 items-end", o ? "justify-center w-full" : r ? "justify-end" : "justify-start")}>{!r && !o && <_e className="h-8 w-8 mr-2 shrink-0">{(u = t.sender) != null && u.avatar_url ? <Ce src={t.sender.avatar_url} alt={((v = t.sender) == null ? void 0 : v.full_name) || "Cliente"} /> : null}<ke className="text-xs bg-muted">{Me((N = t.sender) == null ? void 0 : N.full_name)}</ke></_e>}<div className={q("relative min-w-0 flex flex-col", o ? "w-full max-w-md items-center" : r ? "items-end max-w-[82%] sm:max-w-[72%]" : "items-start max-w-[82%] sm:max-w-[72%]")}>{(((X = (Q = c == null ? void 0 : c.whatsapp_contact) == null ? void 0 : Q[0]) == null ? void 0 : X.is_group) || ((Z = c == null ? void 0 : c.client) == null ? void 0 : Z.is_group)) && !r && !o && (((ae = t.sender) == null ? void 0 : ae.full_name) || ((se = t.sender) == null ? void 0 : se.phone)) && <span className="text-[10px] font-semibold text-muted-foreground ml-1 mb-0.5 max-w-[300px] truncate">{(($ = t.sender) == null ? void 0 : $.full_name) || "Desconhecido"} {(J = t.sender) != null && J.phone ? <span className="font-normal opacity-75 ml-1">({t.sender.phone})</span> : null}</span>}{r && !o && <span className="text-[10px] font-semibold text-muted-foreground mr-1 mb-0.5 max-w-[300px] truncate block">{P_hdr}</span>}<div className={q("rounded-2xl px-4 py-3 shadow-sm min-w-0 break-words [overflow-wrap:anywhere]", o ? "bg-muted/50 border border-border text-center mx-auto text-xs font-medium py-1 px-3 rounded-full" : r ? "bubble-agent rounded-br-none" : "bg-card border border-border rounded-bl-none text-foreground")}>{o ? <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1"><Nt className="h-3 w-3" /> Sistema</div> : null}{po(t.content, t.message_type, c)}<div className="flex items-center justify-end gap-1 mt-1.5 select-none opacity-60"><span className="text-[10px] font-medium">{va(t.created_at)}</span>{r && !o && t.is_read && <Jt className="h-3 w-3 text-accent-foreground/80" />}</div></div>{xs[t.id] && <button onClick={() => Qr(t.id)} className={q("absolute -bottom-2.5 flex items-center justify-center bg-card border border-border shadow-sm rounded-full px-1.5 py-0.5 text-[11px] hover:scale-110 active:scale-95 transition-transform select-none z-10 animate-in zoom-in-50 duration-150", r ? "right-3" : "left-3")} title="Clique para remover reação">{xs[t.id]}</button>}</div>{!o && <Gt><Ut asChild={!0} onClick={T => T.stopPropagation()}><button className={q("absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-accent rounded-full hover:bg-muted z-20", r ? "right-full mr-1" : "left-full ml-1")} title="Ações"><ti className="h-3.5 w-3.5" /></button></Ut><Kt align={r ? "end" : "start"} className="w-auto p-1.5 bg-card border border-border shadow-xl rounded-full flex items-center gap-0.5 z-50" onClick={T => T.stopPropagation()}><He><Je asChild={!0}><button className="p-2 text-muted-foreground hover:text-accent rounded-full hover:bg-muted transition-colors" title="Reagir"><ai className="h-4 w-4" /></button></Je><Xe align="start" className="p-1 flex gap-1.5 bg-card border border-border shadow-xl rounded-full">{["👍", "❤️", "😂", "😮", "😢", "🙏"].map(T => <button onClick={() => Fr(t.id, T)} className="hover:scale-125 active:scale-90 transition-transform p-1 text-base leading-none">{T}</button>)}</Xe></He><button onClick={() => ca(t)} className="p-2 text-muted-foreground hover:text-accent rounded-full hover:bg-muted transition-colors" title="Responder"><Sa className="h-4 w-4 -scale-x-100" /></button><button onClick={() => pt(t)} className="p-2 text-muted-foreground hover:text-accent rounded-full hover:bg-muted transition-colors" title="Encaminhar"><Sa className="h-4 w-4" /></button>{(t.message_type === "image" || t.message_type === "video" || t.message_type === "audio" || t.message_type === "document" || t.content.match(/https?:\/\/[^\s]+/g)) && <button onClick={() => {
                          const T = t.content.match(/https?:\/\/[^\s]+/g);
                          if (T) {
                            const de = T[0],
                              me = document.createElement("a");
                            me.href = de, me.target = "_blank", me.download = "midia", document.body.appendChild(me), me.click(), document.body.removeChild(me);
                          }
                        }} className="p-2 text-muted-foreground hover:text-accent rounded-full hover:bg-muted transition-colors" title="Baixar mídia"><si className="h-4 w-4" /></button>}</Kt></Gt>}{r && <_e className="h-8 w-8 ml-2 shrink-0">{t.sender && t.sender.avatar_url || G != null && G.avatar_url ? <Ce src={t.sender && t.sender.avatar_url || G.avatar_url} alt={P_name} /> : null}<ke className="text-xs bg-accent text-accent-foreground">{Me(P_name)}</ke></_e>}</div>;
                })}<div ref={y} /></div><div className="px-4 py-2 flex gap-2 border-t border-border bg-card overflow-x-auto"><m variant="outline" size="sm" className="gap-1 shrink-0" onClick={As} disabled={qe.isPending}><bt className="h-3 w-3" />{qe.isPending ? "Agendando..." : "Agendar Visita"}</m><m variant="outline" size="sm" className="gap-1 shrink-0" onClick={an} disabled={ie.isPending}><rt className="h-3 w-3" />Enviar Ficha</m><m variant="outline" size="sm" className="gap-1 shrink-0" onClick={sn} disabled={ie.isPending}><rr className="h-3 w-3" />Solicitar Docs</m></div><div className="p-4 border-t border-border bg-card">{Be && <div className="flex items-center justify-between bg-muted/50 border-l-4 border-accent px-3.5 py-2 rounded-lg mb-3 animate-in slide-in-from-bottom-2 duration-150"><div className="min-w-0"><p className="text-[10px] uppercase font-bold text-accent">Respondendo a {((Os = Be.sender) == null ? void 0 : Os.full_name) || "Cliente"}</p><p className="text-xs text-muted-foreground truncate">{Be.content}</p></div><m variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-accent rounded-full shrink-0" onClick={() => ca(null)}><xe className="h-3.5 w-3.5" /></m></div>}<div className="flex items-center gap-2"><input ref={ms} type="file" className="hidden" accept="image/*,video/*,audio/*" onChange={Es} /><input ref={us} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" onChange={Es} /><He><Je asChild={!0}><m variant="ghost" size="icon" disabled={I} title="Anexar arquivos">{I ? <span className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : <ri className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors" />}</m></Je><Xe align="start" className="w-56 p-1.5 space-y-1 bg-card border border-border shadow-lg rounded-xl"><Y onClick={() => {
                        var t;
                        return (t = ms.current) == null ? void 0 : t.click();
                      }} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors"><ni className="h-4 w-4 text-blue-600" /><span className="text-sm font-medium">Fotos e vídeos</span></Y><Y onClick={nn} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors"><Aa className="h-4 w-4 text-pink-600" /><span className="text-sm font-medium">Câmera</span></Y><Y onClick={() => {
                        var t;
                        return (t = us.current) == null ? void 0 : t.click();
                      }} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors"><rt className="h-4 w-4 text-purple-600" /><span className="text-sm font-medium">Documento</span></Y><Y onClick={() => {
                        Et(""), Pt(""), $t(""), Rt(""), mt(!0);
                      }} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors"><Ze className="h-4 w-4 text-orange-600" /><span className="text-sm font-medium">Contato</span></Y><Y onClick={un} className="flex items-center gap-3 cursor-pointer py-2 rounded-lg hover:bg-accent/10 text-foreground transition-colors"><ii className="h-4 w-4 text-emerald-600" /><span className="text-sm font-medium">Localização</span></Y></Xe></He><He><Je asChild={!0}><m variant="ghost" size="icon" title="Respostas rápidas"><he className="h-4 w-4 text-muted-foreground" /></m></Je><Xe align="end" className="w-72"><Pa>Respostas rápidas</Pa><Vt /><Y onClick={() => {
                        var t;
                        return M(`Olá ${((t = c.client) == null ? void 0 : t.full_name) || ""}! Sou corretor da imobiliária. Em que posso ajudar?`);
                      }}><span className="text-sm">Saudação inicial</span></Y><Y onClick={() => {
                        var t;
                        return M(`Olá ${((t = c.client) == null ? void 0 : t.full_name) || ""}! Segue a ficha cadastral para preenchimento. Por favor, preencha todos os campos e nos envie de volta o mais breve possível para darmos continuidade ao processo.`);
                      }}><span className="text-sm">Solicitar ficha cadastral</span></Y><Y onClick={() => {
                        var t;
                        return M(`Olá ${((t = c.client) == null ? void 0 : t.full_name) || ""}! Para avançarmos no processo, precisamos dos seguintes documentos:

• RG e CPF
• Comprovante de renda (últimos 3 meses)
• Comprovante de endereço
• Certidão de estado civil

Por favor, envie as cópias digitalizadas por aqui.`);
                      }}><span className="text-sm">Solicitar documentos</span></Y><Y onClick={() => M(Da(Te))}><span className="text-sm">Oferecer imóvel</span></Y><Y onClick={() => {
                        var t;
                        return M(`Olá ${((t = c.client) == null ? void 0 : t.full_name) || ""}! Agradecemos o contato. Ficamos à disposição para qualquer dúvida.`);
                      }}><span className="text-sm">Agradecimento / Encerramento</span></Y><Y onClick={() => M(Ta(gt))}><span className="text-sm">Agendar visita</span></Y></Xe></He>{zt ? <div className="flex-1 flex items-center justify-between py-2 px-4 rounded-lg bg-red-50/50 border border-red-200 animate-in fade-in duration-200"><div className="flex items-center gap-3"><div className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" /></div><span className="text-red-600 font-medium font-mono text-sm">{mn(Wr)}</span></div><div className="flex items-center gap-2"><m variant="ghost" size="icon" onClick={cn} className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors" title="Cancelar gravação"><oi className="h-4 w-4" /></m><m variant="cta" size="sm" onClick={dn} className="h-8 gap-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border-0"><Ea className="h-3.5 w-3.5" /><span className="text-xs font-medium">Enviar</span></m></div></div> : <input type="text" value={R} onChange={t => M(t.target.value)} onKeyDown={en} placeholder="Digite sua mensagem..." className="flex-1 py-3 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" />}{!zt && (R.trim() ? <m variant="cta" size="icon" onClick={Ss} disabled={ie.isPending || I}><Ea className="h-4 w-4" /></m> : <m variant="secondary" size="icon" onClick={ln} disabled={ie.isPending || I} className="bg-accent/10 text-accent hover:bg-accent/20 transition-colors" title="Gravar áudio"><li className="h-4 w-4" /></m>)}</div><span className="text-xs text-muted-foreground mt-1 block">Pressione Enter para enviar</span></div></e.Fragment> : <div className="flex-1 flex items-center justify-center text-muted-foreground"><div className="text-center"><he className="h-16 w-16 mx-auto mb-4 opacity-20" /><p className="text-lg font-medium">Selecione uma conversa</p><p className="text-sm">Escolha uma conversa à esquerda para começar</p></div></div>}</div>{c && Fe && <div className="hidden xl:block w-[280px] border-l border-border bg-card overflow-y-auto">{c.whatsapp_contact && (Ws = c.whatsapp_contact[0]) != null && Ws.is_group || (Vs = c.client) != null && Vs.is_group ? <uo conversation={c} onSelectParticipant={Ps} /> : <div className="p-6"><div className="text-center mb-6"><_e className="h-20 w-20 mx-auto mb-3">{(Fs = c.client) != null && Fs.avatar_url ? <Ce src={c.client.avatar_url} alt={((Qs = c.client) == null ? void 0 : Qs.full_name) || "Cliente"} className="object-cover" /> : null}<ke className="text-2xl bg-primary text-primary-foreground">{Me((Bs = c.client) == null ? void 0 : Bs.full_name)}</ke></_e><h3 className="font-semibold text-lg text-foreground">{((Gs = c.client) == null ? void 0 : Gs.full_name) || "Cliente"}</h3><p className="text-sm text-muted-foreground">Lead via WhatsApp</p><div className="flex items-center justify-center gap-2 mt-3"><U variant="outline" className="text-[10px]">{c.status === "open" ? "Atendimento em andamento" : "Atendimento encerrado"}</U></div><div className="flex items-center justify-center gap-3 mt-3">{((Us = c.client) == null ? void 0 : Us.phone) && <m variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
                    var t, r;
                    return window.open(`https://wa.me/${(r = (t = c.client) == null ? void 0 : t.phone) == null ? void 0 : r.replace(/\D/g, "")}`, "_blank");
                  }}><Oe className="h-3 w-3" /> WhatsApp</m>}{((Ks = c.client) == null ? void 0 : Ks.email) && <m variant="outline" size="sm" className="gap-1 text-xs" onClick={() => window.open(`mailto:${c.client.email}`, "_blank")}><ka className="h-3 w-3" /> Email</m>}</div></div><div className="rounded-lg border bg-muted/30 p-4 space-y-3"><h4 className="text-sm font-medium text-foreground flex items-center justify-between gap-2"><span className="flex items-center gap-2"><xr className="h-3.5 w-3.5" /> Dados de contato</span>{!Za && <m variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-accent rounded-md" title="Editar contato" onClick={() => {
                    var t, r, o, u;
                    es(((t = c.client) == null ? void 0 : t.full_name) || ""), ts(dr((r = c.client) == null ? void 0 : r.email) ? "" : ((o = c.client) == null ? void 0 : o.email) || ""), ss(bn((u = c.client) == null ? void 0 : u.phone) || ""), ta(!0);
                  }}><ci className="h-3.5 w-3.5" /></m>}</h4>{Za ? <div className="space-y-3 pt-1"><div className="space-y-1"><label className="text-[10px] uppercase font-semibold text-muted-foreground">Nome Completo</label><input type="text" value={ct} onChange={t => es(t.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent text-foreground font-medium" placeholder="Nome do cliente" /></div><div className="space-y-1"><label className="text-[10px] uppercase font-semibold text-muted-foreground">Email</label><input type="email" value={aa} onChange={t => ts(t.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent text-foreground font-medium" placeholder="Sem email" /></div><div className="space-y-1"><label className="text-[10px] uppercase font-semibold text-muted-foreground">Telefone / WhatsApp</label><input type="text" value={as} onChange={t => ss(t.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-accent text-foreground font-medium" placeholder="Ex: 5511999999999" /></div><div className="flex gap-2 pt-2"><m variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => ta(!1)} disabled={sa}>Cancelar</m><m variant="cta" size="sm" className="flex-1 h-7 text-xs font-semibold" onClick={Zr} disabled={sa || !ct.trim()}>{sa ? "Salvando..." : "Salvar"}</m></div></div> : <e.Fragment><div className="flex items-start gap-3"><Ze className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Nome</p><p className="text-sm font-medium">{((Hs = c.client) == null ? void 0 : Hs.full_name) || "Cliente"}</p></div></div><div className="flex items-start gap-3"><ka className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Email</p>{dr((Js = c.client) == null ? void 0 : Js.email) ? <p className="text-sm font-medium text-muted-foreground/60 italic">Não informado</p> : <p className="text-sm font-medium">{(Xs = c.client) == null ? void 0 : Xs.email}</p>}</div></div><div className="flex items-start gap-3"><Oe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Telefone / WhatsApp</p>{(Ys = c.client) != null && Ys.phone ? <p className="text-sm font-medium">{gn(c.client.phone)}</p> : <p className="text-sm font-medium text-muted-foreground/60 italic">Não informado</p>}</div></div><div className="flex items-start gap-3"><he className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Canal de origem</p><p className="text-sm font-medium">WhatsApp Business</p></div></div><div className="flex items-start gap-3"><Ga className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Última interação</p><p className="text-sm font-medium">{va(c.last_message_at)}</p></div></div></e.Fragment>}</div>{L && <div className="mt-4 rounded-lg border bg-background p-4 space-y-3"><div className="flex items-start justify-between gap-3"><div><h4 className="text-sm font-medium text-foreground flex items-center gap-2"><ar className="h-3.5 w-3.5" /> Próxima ação</h4><p className="mt-1 text-xs text-muted-foreground">{at(L.next_action)}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{fo(L.next_action)}</p></div><U variant="outline" className={q("border text-[10px]", Qt(L.next_action))}>{L.action_priority || 0}</U></div><div className="grid grid-cols-3 gap-1.5 text-center text-[11px]"><div className="rounded-md border bg-muted/20 px-1.5 py-1"><p className="font-semibold text-foreground">{L.action_priority || 0}</p><p className="text-muted-foreground">Prior.</p></div><div className="rounded-md border bg-muted/20 px-1.5 py-1"><p className="font-semibold text-foreground">{qa(L)}%</p><p className="text-muted-foreground">Perfil</p></div><div className="rounded-md border bg-muted/20 px-1.5 py-1"><p className="font-semibold text-foreground">{ho(L.score_confianca)}</p><p className="text-muted-foreground">Lead</p></div></div><div className="space-y-1.5"><div className="flex items-center justify-between text-[11px] text-muted-foreground"><span>Perfil</span><span>{qa(L)}%</span></div><div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{
                      width: `${qa(L)}%`
                    }} /></div></div>{(L.missing_fields || []).length > 0 ? <div className="flex flex-wrap gap-1">{(L.missing_fields || []).slice(0, 5).map(t => <U variant="outline" className="h-5 px-1.5 text-[10px]">{jt(t)}</U>)}</div> : <p className="text-xs text-muted-foreground">Dados principais preenchidos.</p>}<m variant="outline" size="sm" className="h-8 w-full justify-start gap-2 text-xs" onClick={() => {
                  const t = (L.missing_fields || []).map(jt).join(", ");
                  M(t ? `Para eu te ajudar melhor, posso confirmar rapidinho: ${t}?` : "Com essas informações já consigo buscar opções melhores para você. Quer priorizar valor, localização ou tamanho?");
                }}><he className="h-3.5 w-3.5" /> Preparar resposta</m><div className="grid grid-cols-2 gap-1.5"><m variant="outline" size="sm" className="h-8 justify-start gap-2 text-xs" onClick={() => M(Ta(gt))}><bt className="h-3.5 w-3.5" /> Visita</m><m variant="outline" size="sm" className="h-8 justify-start gap-2 text-xs" onClick={() => M(Da(Te))}><Ia className="h-3.5 w-3.5" /> Imovel</m></div></div>}{Te.length > 0 && <div className="mt-4 rounded-lg border bg-violet-50/50 p-4 space-y-3"><div className="flex items-center justify-between gap-2"><h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Ia className="h-3.5 w-3.5" /> Imoveis recomendados</h4><U variant="outline" className="border-violet-200 bg-white text-[10px] text-violet-700">{Te.length} opcoes</U></div><m variant="outline" size="sm" className="h-8 w-full justify-start gap-2 border-violet-200 bg-white text-xs text-violet-700 hover:bg-violet-100" onClick={() => M(Da(Te))}><he className="h-3.5 w-3.5" /> Preparar lista com ate 3 opcoes</m><div className="space-y-2">{Te.map(t => {
                    const r = !!(L != null && L.suggested_property_id) && L.suggested_property_id === t.property_id,
                      o = Dr(t),
                      u = Tr(t.property_id);
                    return <div className="rounded-md border bg-white p-3 space-y-2"><div className="flex items-start gap-3"><div className="h-14 w-16 shrink-0 overflow-hidden rounded-md border bg-background">{o ? <img src={o} alt={t.property_title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-violet-500"><Ia className="h-5 w-5" /></div>}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h5 className="truncate text-sm font-medium text-foreground">{t.property_title}</h5><U variant="outline" className="shrink-0 border-violet-200 bg-violet-50 text-[10px] text-violet-700">{t.match_score}</U></div><p className="mt-0.5 truncate text-xs text-muted-foreground">{t.property_code || "Sem codigo"} - {t.property_location}</p><p className="mt-1 text-sm font-semibold text-violet-800">{Yt(t.property_price)}</p></div></div>{(t.match_reasons || []).length > 0 && <div className="flex flex-wrap gap-1">{(t.match_reasons || []).slice(0, 3).map(v => <U variant="outline" className="h-5 border-violet-200 bg-violet-50 px-1.5 text-[10px] text-violet-700">{v}</U>)}</div>}<div className="grid grid-cols-3 gap-1.5 text-center text-[11px]"><div className="rounded-md border bg-muted/20 px-1.5 py-1"><p className="font-semibold text-foreground">{t.bedrooms || "-"}</p><p className="text-muted-foreground">Quartos</p></div><div className="rounded-md border bg-muted/20 px-1.5 py-1"><p className="font-semibold text-foreground">{t.parking || "-"}</p><p className="text-muted-foreground">Vagas</p></div><div className="rounded-md border bg-muted/20 px-1.5 py-1"><p className="truncate font-semibold text-foreground">{t.area || "-"}</p><p className="text-muted-foreground">Area</p></div></div><div className="grid grid-cols-2 gap-1.5"><m variant="outline" size="sm" className="h-8 justify-start gap-2 text-xs" onClick={() => M(mr(t))}><he className="h-3.5 w-3.5" /> Preparar</m><m variant="cta" size="sm" className="h-8 justify-start gap-2 text-xs" onClick={() => Kr(t)} disabled={ie.isPending || _s.isPending}><Ea className="h-3.5 w-3.5" /> Enviar</m><m variant="outline" size="sm" className="h-8 justify-start gap-2 border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-50" onClick={() => M(Ta(t))}><bt className="h-3.5 w-3.5" /> Visita</m><m variant="outline" size="sm" className="h-8 justify-start gap-2 text-xs" onClick={() => u && window.open(u, "_blank", "noopener,noreferrer")} disabled={!u}><di className="h-3.5 w-3.5" /> Abrir</m></div>{r && <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-700"><Jt className="h-3.5 w-3.5" /> Ja registrado como indicado no lead</p>}</div>;
                  })}</div></div>}<div className="mt-6 space-y-2 border-t pt-4 border-border"><h4 className="text-sm font-medium text-foreground mb-2">Ações rápidas</h4><m variant="outline" className="w-full gap-2 justify-start" onClick={As} disabled={qe.isPending}><bt className="h-4 w-4" />{qe.isPending ? "Agendando..." : "Agendar Visita"}</m><m variant="outline" className="w-full gap-2 justify-start" onClick={rn}><rt className="h-4 w-4" />Criar Proposta</m><m variant="outline" className="w-full gap-2 justify-start" onClick={() => A("/leads")}><rr className="h-4 w-4" />Ver no Funil de Leads</m></div><div className="mt-6 rounded-lg border bg-blue-50/50 p-4 space-y-2"><h4 className="text-sm font-medium text-blue-800 flex items-center gap-2"><Wa className="h-3.5 w-3.5" /> Sobre este atendimento</h4><p className="text-xs text-blue-700">Este cliente entrou em contato pelo WhatsApp da imobiliária. Todas as mensagens são sincronizadas em tempo real.</p></div></div>}</div>}</div>}</main></div>{le && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => Se(!1)}><div className="bg-card rounded-xl p-6 w-[420px] shadow-xl" onClick={t => t.stopPropagation()}><h3 className="font-semibold text-lg text-foreground mb-1">Agendar Visita</h3><p className="text-sm text-muted-foreground mb-5">Selecione a data e horário para a visita com {((Zs = c == null ? void 0 : c.client) == null ? void 0 : Zs.full_name) || "o cliente"}.</p><div className="space-y-4"><div><label className="block text-sm font-medium text-foreground mb-1">Data</label><input type="date" value={Ae} onChange={t => Ve(t.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></div><div><label className="block text-sm font-medium text-foreground mb-1">Horário</label><select value={ge} onChange={t => be(t.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent">{Array.from({
                length: 22
              }, (t, r) => {
                const o = Math.floor(r / 2) + 8,
                  u = r % 2 === 0 ? "00" : "30",
                  v = `${String(o).padStart(2, "0")}:${u}`;
                return <option value={v}>{v}</option>;
              })}</select></div></div><div className="flex gap-2 mt-6 justify-end"><m variant="outline" onClick={() => Se(!1)}>Cancelar</m><m variant="cta" className="gap-2" onClick={tn} disabled={!Ae || !ge || qe.isPending}><bt className="h-4 w-4" />{qe.isPending ? "Agendando..." : "Confirmar Agendamento"}</m></div></div></div>}{ee && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => ve(!1)}><div className="bg-card rounded-xl p-6 w-[400px] shadow-xl border border-border" onClick={t => t.stopPropagation()}><h3 className="font-semibold text-lg text-foreground mb-2 flex items-center gap-2 text-destructive">Excluir Atendimento</h3><p className="text-sm text-muted-foreground mb-5">Tem certeza que deseja excluir esta conversa? Esta ação apagará permanentemente o atendimento e todas as mensagens do banco de dados e **não pode ser desfeita**.</p><div className="flex gap-2 justify-end"><m variant="outline" onClick={() => ve(!1)}>Cancelar</m><m variant="destructive" className="gap-2" onClick={Jr} disabled={ma.isPending}>{ma.isPending ? "Excluindo..." : "Sim, Excluir"}</m></div></div></div>}{Dt && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => pt(null)}><div className="bg-card rounded-2xl p-6 w-full max-w-[480px] mx-4 shadow-2xl border border-border text-foreground space-y-4 animate-in scale-in duration-200" onClick={t => t.stopPropagation()}><div className="flex items-center justify-between border-b pb-3 border-border/80"><h3 className="font-semibold text-lg flex items-center gap-2"><Sa className="h-5 w-5 text-accent animate-pulse" /> Encaminhar Mensagem</h3><m variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => pt(null)}><xe className="h-4 w-4" /></m></div><div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/60 italic max-h-[80px] overflow-y-auto">"{Dt.content}"</div><div className="relative"><Ma className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Buscar conversa ou corretor..." value={ht} onChange={t => Vr(t.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent text-foreground" /></div><div className="space-y-4 max-h-[300px] overflow-y-auto pr-1"><div className="space-y-1.5"><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Atendimentos Ativos</p>{H.filter(t => {
              var r, o;
              return ((o = (r = t.client) == null ? void 0 : r.full_name) == null ? void 0 : o.toLowerCase().includes(ht.toLowerCase())) && t.status !== "deleted" && t.subject !== "[deleted]";
            }).slice(0, 5).map(t => {
              var r, o, u, v;
              return <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-border"><div className="min-w-0 flex items-center gap-2"><_e className="h-7 w-7">{(r = t.client) != null && r.avatar_url ? <Ce src={t.client.avatar_url} alt={((o = t.client) == null ? void 0 : o.full_name) || "Cliente"} /> : null}<ke className="text-[10px] bg-primary text-primary-foreground">{Me((u = t.client) == null ? void 0 : u.full_name)}</ke></_e><span className="text-xs font-medium truncate">{((v = t.client) == null ? void 0 : v.full_name) || "Cliente"}</span></div><m size="sm" variant="outline" className="h-7 text-xs font-semibold px-3 hover:bg-accent hover:text-accent-foreground hover:border-accent" onClick={async () => {
                  var N;
                  try {
                    await ie.mutateAsync({
                      conversationId: t.id,
                      content: Dt.content
                    }), C({
                      title: "Mensagem encaminhada!",
                      description: `Encaminhada para ${(N = t.client) == null ? void 0 : N.full_name}`
                    }), pt(null);
                  } catch (Q) {
                    C({
                      title: "Erro ao encaminhar",
                      description: Q.message,
                      variant: "destructive"
                    });
                  }
                }}>Enviar</m></div>;
            })}{H.filter(t => {
              var r, o;
              return ((o = (r = t.client) == null ? void 0 : r.full_name) == null ? void 0 : o.toLowerCase().includes(ht.toLowerCase())) && t.status !== "deleted" && t.subject !== "[deleted]";
            }).length === 0 && <p className="text-xs text-muted-foreground italic pl-2">Nenhum atendimento encontrado</p>}</div><div className="space-y-1.5 pt-2 border-t border-border/60"><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Equipe / Corretores</p>{Tt.filter(t => {
              var r;
              return (r = t.full_name) == null ? void 0 : r.toLowerCase().includes(ht.toLowerCase());
            }).slice(0, 5).map(t => <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-border"><div className="min-w-0 flex items-center gap-2"><_e className="h-7 w-7">{t.avatar_url ? <Ce src={t.avatar_url} alt={t.full_name} /> : null}<ke className="text-[10px] bg-accent text-accent-foreground">{Me(t.full_name)}</ke></_e><div className="min-w-0"><p className="text-xs font-medium truncate">{t.full_name}</p><p className="text-[9px] text-muted-foreground uppercase font-bold">{t.role === "admin" ? "Admin" : "Corretor"}</p></div></div><m size="sm" variant="outline" className="h-7 text-xs font-semibold px-3 hover:bg-accent hover:text-accent-foreground hover:border-accent" onClick={async () => {
                try {
                  const r = H.find(u => u.client_id === t.id);
                  let o = r == null ? void 0 : r.id;
                  o || (o = (await Lt.mutateAsync({
                    client_id: t.id,
                    subject: `Chat Equipe - ${t.full_name}`
                  })).id), await ie.mutateAsync({
                    conversationId: o,
                    content: Dt.content
                  }), C({
                    title: "Mensagem encaminhada!",
                    description: `Encaminhada para o corretor ${t.full_name}`
                  }), pt(null);
                } catch (r) {
                  C({
                    title: "Erro ao encaminhar",
                    description: r.message,
                    variant: "destructive"
                  });
                }
              }}>Enviar</m></div>)}{Tt.filter(t => {
              var r;
              return (r = t.full_name) == null ? void 0 : r.toLowerCase().includes(ht.toLowerCase());
            }).length === 0 && <p className="text-xs text-muted-foreground italic pl-2">Nenhum corretor encontrado</p>}</div></div></div></div>}{it && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => ot(null)}><div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 text-foreground" onClick={t => t.stopPropagation()}><div className="flex items-center justify-between border-b border-border/70 pb-3"><h3 className="font-semibold text-base flex items-center gap-2"><sr className="h-4 w-4 text-accent" />Transferir atendimento</h3><m variant="ghost" size="icon" onClick={() => ot(null)} className="h-8 w-8 rounded-full"><xe className="h-4 w-4" /></m></div><div className="space-y-2"><label className="text-sm font-medium text-muted-foreground">Corretor responsavel</label><select value={lt} onChange={t => ea(t.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"><option value="">Selecione um corretor</option>{Tt.map(t => <option value={t.id}>{t.full_name} ({t.role === "admin" ? "Admin" : "Corretor"})</option>)}</select></div><div className="flex justify-end gap-2 pt-2"><m variant="outline" onClick={() => ot(null)}>Cancelar</m><m variant="cta" onClick={Yr} disabled={Xa || !lt}>{Xa ? "Transferindo..." : "Transferir"}</m></div></div></div>}<ao open={ue} onOpenChange={ce} onConfirm={hn} defaultLeadId={(tr = (er = O.state) == null ? void 0 : er.leadToMessage) == null ? void 0 : tr.id} /><mo open={Pe} onOpenChange={$e} /><Ni open={Br} onOpenChange={hs} />{Mr && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => Qe(!1)}><div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in scale-in duration-200 text-foreground" onClick={t => t.stopPropagation()}><div className="flex items-center justify-between border-b border-border/60 pb-3"><h3 className="text-lg font-semibold tracking-tight flex items-center gap-2"><Bt className="h-5 w-5 text-accent" />Adicionar Novo Contato</h3><m variant="ghost" size="icon" onClick={() => Qe(!1)} className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-muted/50 transition-colors"><xe className="h-4 w-4" /></m></div><div className="space-y-3"><div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Nome Completo *</label><input type="text" placeholder="Ex: João da Silva" value={dt} onChange={t => ns(t.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></div><div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">WhatsApp / Telefone *</label><input type="text" placeholder="Ex: 5511999999999" value={St} onChange={t => is(t.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" /><p className="text-[10px] text-muted-foreground">Insira apenas números com código de país e DDD (Ex: 5511999999999).</p></div><div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">E-mail (Opcional)</label><input type="email" placeholder="Ex: joao@email.com" value={os} onChange={t => ls(t.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" /></div></div><div className="flex justify-end gap-2 pt-2 border-t border-border/60"><m variant="outline" onClick={() => Qe(!1)}>Cancelar</m><m variant="cta" onClick={fn} disabled={cs || !dt.trim() || !St.trim()}>{cs ? "Salvando..." : "Adicionar Contato"}</m></div></div></div>}{nt && c && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"><div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border/80 shadow-2xl animate-in scale-in duration-200 text-foreground space-y-6"><div className="flex items-center justify-between border-b border-border/60 pb-3"><h3 className="text-lg font-semibold tracking-tight">Configurações do Atendimento</h3><m variant="ghost" size="icon" onClick={() => Re(!1)} className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-muted/50 transition-colors"><xe className="h-4 w-4" /></m></div><div className="space-y-4"><div className="space-y-2"><label className="text-sm font-medium text-muted-foreground">Status do Ticket</label><select value={E} onChange={t => P(t.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium text-foreground transition-all cursor-pointer"><option value="pending">Pendente</option><option value="open">Aberto</option><option value="waiting">Aguardando</option><option value="closed">Fechado</option></select></div><div className="space-y-2"><label className="text-sm font-medium text-muted-foreground">Estagio do Atendimento</label><select value={(c == null ? void 0 : c.stage) || "Contato Cadastrado"} onChange={async t => {
              const V = t.target.value;
              if (!c) return;
              const lid = (c == null ? void 0 : c.lead_id) || null;
              if (lid) {
                try {
                  const {
                    error: er
                  } = await B.from("leads").update({
                    stage: V
                  }).eq("id", lid);
                  er && console.error("estagio:", er.message);
                } catch (ex) {
                  console.error('estagio', ex);
                }
              }
            }} className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium text-foreground transition-all cursor-pointer"><option value="Contato Cadastrado">Contato Cadastrado</option><option value="Primeiro Atendimento / Qualificacao">Primeiro Atendimento / Qualificacao</option><option value="Qualificado">Qualificado</option><option value="Follow Up">Follow Up</option><option value="Buscar Imovel">Buscar Imovel</option><option value="Agendamento visita/reuniao">Agendamento visita/reuniao</option><option value="Visita / Reuniao Agendada">Visita / Reuniao Agendada</option><option value="Match Pronto">Match Pronto</option><option value="Apresentar Imoveis Selecionados">Apresentar Imoveis Selecionados</option><option value="Imovel Escolhido">Imovel Escolhido</option><option value="Proposta Solicitada">Proposta Solicitada</option><option value="Vendido">Vendido</option></select></div><div className="space-y-2"><label className="text-sm font-medium text-muted-foreground">Corretor Responsável</label><select value={_ || ""} onChange={t => D(t.target.value || null)} className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium text-foreground transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"><option value="">Ninguém atribuído</option>{Tt.map(t => <option value={t.id}>{t.full_name} ({t.role === "admin" ? "Admin" : "Corretor"})</option>)}</select></div><div className="rounded-xl border border-border bg-muted/20 p-3"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><div className={q("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", Ne ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}><Nt className="h-4 w-4" /></div><div className="min-w-0"><p className="text-sm font-semibold text-foreground">Inteligencia artificial</p><p className="text-xs text-muted-foreground">{Ne ? "IA ativa neste atendimento." : "Atendimento manual, sem respostas automaticas."}</p></div></div><Ht checked={Ne} onCheckedChange={ha} disabled={xa.isPending} aria-label="Ativar ou pausar IA neste atendimento" /></div></div></div><div className="flex gap-3 justify-end pt-3 border-t border-border/60"><m variant="outline" onClick={() => Re(!1)} className="rounded-lg px-4">Cancelar</m><m variant="cta" onClick={async () => {
            try {
              await ua.mutateAsync({
                conversationId: c.id,
                status: E,
                agentId: _,
                oldStatus: c.status,
                oldAgentId: c.agent_id || null,
                actorId: j == null ? void 0 : j.id
              }), C({
                title: "Sucesso!",
                description: "Configurações de atendimento salvas com sucesso."
              }), Re(!1);
            } catch (t) {
              C({
                title: "Erro ao salvar",
                description: t.message,
                variant: "destructive"
              });
            }
          }} disabled={ua.isPending} className="rounded-lg px-4 gap-2 font-medium">{ua.isPending ? "Salvando..." : "Salvar Alterações"}</m></div></div></div>}{Lr && <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4"><div className="flex items-center justify-between border-b pb-3 border-border"><h3 className="text-base font-semibold text-foreground flex items-center gap-2"><Aa className="h-5 w-5 text-orange-600" /> Câmera ao Vivo</h3><m variant="ghost" size="icon" onClick={ba} className="hover:bg-muted rounded-full"><xe className="h-4 w-4" /></m></div><div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-border shadow-inner"><video ref={ut} autoPlay={!0} playsInline={!0} muted={!0} className="w-full h-full object-cover scale-x-[-1]" /><div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur text-[10px] text-white font-medium flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE</div></div><div className="flex items-center justify-center gap-3 pt-2"><m variant="outline" onClick={ba} className="flex-1 rounded-xl">Cancelar</m><m onClick={on} className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium gap-2 shadow-lg"><Aa className="h-4 w-4" /> Capturar Foto</m></div></div></div>}{Or && <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4"><div className="flex items-center justify-between border-b pb-3 border-border"><h3 className="text-base font-semibold text-foreground flex items-center gap-2"><Ze className="h-4 w-4 text-orange-600" /> Compartilhar Contato</h3><m variant="ghost" size="icon" onClick={() => mt(!1)} className="hover:bg-muted rounded-full"><xe className="h-4 w-4" /></m></div><div className="space-y-3"><div className="space-y-1"><label className="text-xs text-muted-foreground font-medium">Nome Completo</label><input type="text" placeholder="Nome do contato" value={At} onChange={t => Et(t.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent" /></div><div className="space-y-1"><label className="text-xs text-muted-foreground font-medium">Telefone / WhatsApp</label><input type="text" placeholder="(DDD) 99999-9999" value={It} onChange={t => Pt(t.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent" /></div><div className="space-y-1"><label className="text-xs text-muted-foreground font-medium">E-mail</label><input type="email" placeholder="contato@email.com" value={na} onChange={t => $t(t.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent" /></div><div className="space-y-1"><label className="text-xs text-muted-foreground font-medium">Empresa (Opcional)</label><input type="text" placeholder="Nome da empresa" value={ia} onChange={t => Rt(t.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent" /></div></div><div className="flex gap-3 pt-2"><m variant="outline" onClick={() => mt(!1)} className="flex-1 rounded-xl">Cancelar</m><m onClick={pn} disabled={!At.trim() || !It.trim()} className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-lg">Enviar Contato</m></div></div></div>}</div>;
}
function Vo() {
  return <bo><vo /></bo>;
}
export { Vo as default };