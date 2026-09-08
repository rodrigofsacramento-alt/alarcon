/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/use-semantic-search-BCM6aZBa.js | AST | sanitizado | Fase 3 ==*/
const i = (t, o) => {
    if (!t.trim()) return [];
    const e = t.toLowerCase();
    return o.filter(s => s.title.toLowerCase().includes(e) || s.location.toLowerCase().includes(e) || s.id.toLowerCase().includes(e));
  },
  n = (t, o) => {
    if (!t.trim()) return [];
    const e = t.toLowerCase();
    return o.filter(s => {
      var r;
      return s.name.toLowerCase().includes(e) || s.email.toLowerCase().includes(e) || ((r = s.phone) == null ? void 0 : r.includes(e)) || s.id.toLowerCase().includes(e);
    });
  };
export { n as a, i as s };