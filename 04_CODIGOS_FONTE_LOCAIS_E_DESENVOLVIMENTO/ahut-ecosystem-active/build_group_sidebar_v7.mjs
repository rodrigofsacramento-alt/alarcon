import fs from "fs";
import path from "path";

const dirs = [
  "./01_FRONTEND_PRODUCAO_HOSTINGER_BKP",
  "./crm-imobiliaria-producao-BKP"
];

const newIndexName = "index-live-v7.js";
const newAtendimentoName = "Atendimento-live-v7.js";
const ptochLo = "https://ptochsyoyatsydfysacc.supabase.co";
const ptochDo = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.JWT_SUPABASE_REDIGIDO.7VKER8NpJz5F9l0TOd6AWTg5U8f2IyXfcrIXCE0KwkQ";

for (const dir of dirs) {
  const assetsDir = path.join(dir, "assets");
  let indexJs = fs.readFileSync(path.join(assetsDir, "index-live-v6.js"), "utf8");
  let atendimentoJs = fs.readFileSync(path.join(assetsDir, "Atendimento-live-v6.js"), "utf8");

  // 1. In indexJs: update reference to Atendimento-live-v7.js
  indexJs = indexJs.replace(/Atendimento-live-v6\.js/g, newAtendimentoName);
  indexJs = indexJs.replace(/Atendimento-live-v5\.js/g, newAtendimentoName);

  // 2. In atendimentoJs: Remove top header "Painel de Grupo" button
  atendimentoJs = atendimentoJs.replace(
    `e.jsxs(m,{variant:"cta",size:"sm",onClick:()=>console.log("Panel disabled in favor of right sidebar"),className:"gap-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white shadow-sm ml-2",children:[e.jsx(Le,{className:"h-4 w-4"}),e.jsx("span",{className:"hidden md:inline",children:"Painel de Grupo"})]}),`,
    ``
  );
  atendimentoJs = atendimentoJs.replace(
    `e.jsxs(m,{variant:"cta",size:"sm",onClick:()=>ja.getState().openPanel(c.id),className:"gap-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white shadow-sm ml-2",children:[e.jsx(Le,{className:"h-4 w-4"}),e.jsx("span",{className:"hidden md:inline",children:"Painel de Grupo"})]}),`,
    ``
  );

  // 3. In atendimentoJs: Enhance uo component with search input and live filtering
  // In uo: const [l,n]=i.useState([]),[d,p]=i.useState(!1);
  atendimentoJs = atendimentoJs.replace(
    `const[l,n]=i.useState([]),[d,p]=i.useState(!1);`,
    `const[l,n]=i.useState([]),[d,p]=i.useState(!1),[qSearch,setQSearch]=i.useState("");`
  );

  // Search input and filtered list rendering in uo
  const oldHeaderCard = `children:[e.jsx(Le,{className:"h-3.5 w-3.5"})," Participantes do Grupo"]}),e.jsx(m,{variant:"ghost",size:"icon",className:"h-6 w-6",children:e.jsx(Bt,{className:"h-3.5 w-3.5 text-muted-foreground"})})]}),e.jsx("div",{className:"p-3 overflow-y-auto flex-1 space-y-3",children:d?e.jsx("div",{className:"flex items-center justify-center py-6",children:e.jsx(fe,{className:"h-5 w-5 animate-spin text-muted-foreground"})}):l.length>0?l.map(k=>`;

  const newHeaderCard = `children:[e.jsx(Le,{className:"h-3.5 w-3.5"})," Participantes do Grupo"]}),e.jsx("span",{className:"text-[10px] bg-muted px-2 py-0.5 rounded-full font-semibold text-muted-foreground",children:l.length})]}),e.jsx("div",{className:"px-3 pt-2 pb-1 border-b border-border/50",children:e.jsx("input",{type:"text",value:qSearch,onChange:ev=>setQSearch(ev.target.value),placeholder:"Buscar por nome ou telefone...",className:"w-full text-xs bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground"})}),e.jsx("div",{className:"p-3 overflow-y-auto flex-1 space-y-3",children:d?e.jsx("div",{className:"flex items-center justify-center py-6",children:e.jsx(fe,{className:"h-5 w-5 animate-spin text-muted-foreground"})}):l.filter(k=>!qSearch||(k.full_name&&k.full_name.toLowerCase().includes(qSearch.toLowerCase()))||(k.phone&&k.phone.includes(qSearch))).length>0?l.filter(k=>!qSearch||(k.full_name&&k.full_name.toLowerCase().includes(qSearch.toLowerCase()))||(k.phone&&k.phone.includes(qSearch))).map(k=>`;

  if (atendimentoJs.includes(oldHeaderCard)) {
    atendimentoJs = atendimentoJs.replace(oldHeaderCard, newHeaderCard);
    console.log("Replaced uo header and injected search bar in:", dir);
  } else {
    console.log("oldHeaderCard not exact match in:", dir);
  }

  // Write new files
  fs.writeFileSync(path.join(assetsDir, newIndexName), indexJs, "utf8");
  fs.writeFileSync(path.join(assetsDir, newAtendimentoName), atendimentoJs, "utf8");

  // Update index.html
  const cleanHtml = `<!doctype html>
<html lang="pt-BR" class="notranslate" translate="no">
  <head>
    <meta charset="UTF-8" />
    <meta name="google" content="notranslate" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="https://i.imgur.com/bpzYwaT.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="https://i.imgur.com/bpzYwaT.png" />
    <title>Estate.ia CRM - Imobiliária Inteligente</title>
    <meta name="description" content="Estate.ia CRM - Sistema de gestão imobiliária inteligente" />
    <meta name="author" content="Estate.ia" />

    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />

    <script>
      (function() {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(regs) {
            for (var r of regs) r.unregister();
          });
        }
        if (window.caches) {
          caches.keys().then(function(names) {
            for (var name of names) caches.delete(name);
          });
        }
      })();
    </script>

    <script type="module" crossorigin src="/assets/${newIndexName}"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-rUI5cL83.css">
  </head>

  <body class="notranslate" translate="no">
    <div id="root" class="notranslate" translate="no"></div>
  </body>
</html>
`;
  fs.writeFileSync(path.join(dir, "index.html"), cleanHtml, "utf8");

  console.log("Built v7 bundle in:", dir);
}
