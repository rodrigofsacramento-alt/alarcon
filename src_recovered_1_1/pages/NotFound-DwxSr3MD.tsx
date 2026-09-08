/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/NotFound-DwxSr3MD.js | AST | sanitizado | Fase 3 ==*/
import { j as e } from "@/components/query";
import { f as r, r as s } from "@/components/vendor-Jm1Lk";
const a = () => {
  const t = r();
  return s.useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", t.pathname);
  }, [t.pathname]), <div className="flex min-h-screen items-center justify-center bg-muted">{<div className="text-center">{<h1 className="mb-4 text-4xl font-bold">404</h1>}{<p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>}{<a href="/" className="text-primary underline hover:text-primary/90">Return to Home</a>}</div>}</div>;
};
export { a as default };