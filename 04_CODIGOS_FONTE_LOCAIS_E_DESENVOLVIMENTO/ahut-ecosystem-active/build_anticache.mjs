import fs from "fs";
import path from "path";

const dirs = [
  "./01_FRONTEND_PRODUCAO_HOSTINGER_BKP",
  "./crm-imobiliaria-producao-BKP"
];

const newIndexName = "index-live-v5.js";
const newAtendimentoName = "Atendimento-live-v5.js";
const ldfLo = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const ldfDo = "JWT_SUPABASE_REDIGIDO";

for (const dir of dirs) {
  const assetsDir = path.join(dir, "assets");
  let indexJs = fs.readFileSync(path.join(assetsDir, "index-C9-68P_N.js"), "utf8");
  let atendimentoJs = fs.readFileSync(path.join(assetsDir, "Atendimento-DcqAjCvf.js"), "utf8");

  // In index.js replace reference to Atendimento
  indexJs = indexJs.replace(/Atendimento-DcqAjCvf\.js(\?v=[^"'\`]+)?/g, newAtendimentoName);
  indexJs = indexJs.replace(/Atendimento-v2-P42Q\.js(\?v=[^"'\`]+)?/g, newAtendimentoName);
  indexJs = indexJs.replace(/Atendimento-v3-N28Y\.js(\?v=[^"'\`]+)?/g, newAtendimentoName);
  indexJs = indexJs.replace(/const Lo="https:\/\/[^"]+",Do="[^"]+"/g, `const Lo="${ldfLo}",Do="${ldfDo}"`);

  // Remove non-existent email column in profiles queries
  indexJs = indexJs.replace(
    `client:profiles!conversations_client_id_fkey(id, full_name, email, phone, avatar_url),`,
    `client:profiles!conversations_client_id_fkey(id, full_name, phone, avatar_url),`
  );
  indexJs = indexJs.replace(
    `agent:profiles!conversations_agent_id_fkey(id, full_name, email, phone, avatar_url),`,
    `agent:profiles!conversations_agent_id_fkey(id, full_name, phone, avatar_url),`
  );

  // Remove mock GroupSidePanel and floating orange button
  indexJs = indexJs.replace(
    `i.jsx(Td,{name:"GroupSidePanel",children:i.jsx(Cd,{})}),i.jsx("button",{onClick:()=>e("mock-group-123"),className:"fixed bottom-4 right-4 z-50 bg-brand-orange text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform",children:"Painel de Grupo"}),`,
    ``
  );

  // Add 1.2s timeout fallback so AuthProvider never stays stuck
  indexJs = indexJs.replace(
    `const[l,d]=c.useState(!0),[u,m]=c.useState(!0),[p,h]=c.useState(null);c.useEffect(()=>{let v=!1;`,
    `const[l,d]=c.useState(!0),[u,m]=c.useState(!0),[p,h]=c.useState(null);c.useEffect(()=>{let v=!1;setTimeout(()=>{if(!v){d(!1);m(!1);}},1200);`
  );

  // Write new files
  fs.writeFileSync(path.join(assetsDir, newIndexName), indexJs, "utf8");
  fs.writeFileSync(path.join(assetsDir, newAtendimentoName), atendimentoJs, "utf8");

  // Create clean anti-cache index.html
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

  // Create anti-cache .htaccess
  const cleanHtaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\.(html|htm|js|css|json)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </FilesMatch>
</IfModule>
`;
  fs.writeFileSync(path.join(dir, ".htaccess"), cleanHtaccess, "utf8");

  console.log("Configured anti-cache bundle in:", dir);
}
