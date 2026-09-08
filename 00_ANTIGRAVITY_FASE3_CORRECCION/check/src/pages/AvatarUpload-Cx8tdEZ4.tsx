/*== ANTIGRAVITY RECOVERED v2.1 — origem: 1.1/assets/AvatarUpload-Cx8tdEZ4.js | AST | sanitizado | Fase 3 ==*/
import { j as t } from "@/components/query";
import { r as n } from "@/components/vendor-Jm1Lk";
import { A as E, d as U, t as i, s as c } from "@/components/index-C9";
import { L as $, C as k } from "@/components/ui";
const P = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20"
  },
  j = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  },
  F = {
    sm: "h-6 w-6 -bottom-0.5 -right-0.5",
    md: "h-7 w-7 -bottom-0.5 -right-0.5",
    lg: "h-8 w-8 -bottom-1 -right-1"
  };
function D({
  profileId: m,
  currentAvatarUrl: y,
  fullName: u,
  size: s = "md",
  onUploaded: o
}) {
  const [d, p] = n.useState(!1),
    [f, A] = n.useState(y),
    g = n.useRef(null),
    C = u.split(" ").map(a => a[0]).join("").slice(0, 2).toUpperCase(),
    N = async a => {
      var h, v;
      const e = (h = a.target.files) == null ? void 0 : h[0];
      if (e) {
        if (a.target.value = "", e.size > 5 * 1024 * 1024) {
          i({
            title: "Arquivo muito grande",
            description: "Máximo 5MB para fotos de perfil.",
            variant: "destructive"
          });
          return;
        }
        if (!e.type.startsWith("image/")) {
          i({
            title: "Formato inválido",
            description: "Selecione uma imagem (JPG, PNG, WebP).",
            variant: "destructive"
          });
          return;
        }
        p(!0);
        try {
          const r = ((v = e.name.split(".").pop()) == null ? void 0 : v.toLowerCase()) || "jpg",
            b = `${m}/${Date.now()}.${r}`,
            {
              error: w
            } = await c.storage.from("avatars").upload(b, e, {
              upsert: !0
            });
          if (w) throw w;
          const {
              data: S
            } = c.storage.from("avatars").getPublicUrl(b),
            l = S.publicUrl,
            {
              error: x
            } = await c.from("profiles").update({
              avatar_url: l
            }).eq("id", m);
          if (x) throw x;
          A(l), o == null || o(l), i({
            title: "Foto atualizada!",
            description: "Sua foto de perfil foi salva com sucesso."
          });
        } catch (r) {
          i({
            title: "Erro ao enviar foto",
            description: (r == null ? void 0 : r.message) || "Tente novamente.",
            variant: "destructive"
          });
        } finally {
          p(!1);
        }
      }
    };
  return <div className="relative inline-block"><input ref={g} type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={N} /><E className={P[s]}>{f ? <img src={f} alt={u} className="h-full w-full object-cover rounded-full" /> : <U className="bg-primary text-primary-foreground text-xl">{C}</U>}</E><button onClick={() => {
      var a;
      return (a = g.current) == null ? void 0 : a.click();
    }} disabled={d} className={`absolute ${F[s]} rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors border-2 border-card`} title="Alterar foto">{d ? <$ className={`${j[s]} animate-spin`} /> : <k className={j[s]} />}</button></div>;
}
export { D as A };