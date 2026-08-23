import fs from "fs";
import path from "path";

const dirs = [
  "./01_FRONTEND_PRODUCAO_HOSTINGER_BKP",
  "./crm-imobiliaria-producao-BKP"
];

const newIndexName = "index-live-v6.js";
const newAtendimentoName = "Atendimento-live-v6.js";
const ptochLo = "https://ptochsyoyatsydfysacc.supabase.co";
const ptochDo = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.JWT_SUPABASE_REDIGIDO.7VKER8NpJz5F9l0TOd6AWTg5U8f2IyXfcrIXCE0KwkQ";

for (const dir of dirs) {
  const assetsDir = path.join(dir, "assets");
  let indexJs = fs.readFileSync(path.join(assetsDir, "index-live-v5.js"), "utf8");
  let atendimentoJs = fs.readFileSync(path.join(assetsDir, "Atendimento-live-v5.js"), "utf8");

  // In index.js point to ptoch URL and Key
  indexJs = indexJs.replace(/const Lo="https:\/\/[^"]+",Do="[^"]+"/g, `const Lo="${ptochLo}",Do="${ptochDo}"`);
  indexJs = indexJs.replace(/Atendimento-live-v5\.js/g, newAtendimentoName);

  // In Atendimento.js replace any supabase URL/Key if present
  atendimentoJs = atendimentoJs.replace(/https:\/\/ldfcqxeehgaftxsgxkag\.supabase\.co/g, ptochLo);

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

  console.log("Configured ptoch bundle in:", dir);
}

// Also update broker .env files
const brokerEnvs = [
  "./ahut-whatsapp-broker/.env",
  "../02_BACKEND_E_SERVICOS_VPS/ahut-whatsapp-broker/.env"
];

for (const envPath of brokerEnvs) {
  if (fs.existsSync(envPath)) {
    let c = fs.readFileSync(envPath, "utf8");
    c = c.replace(/SUPABASE_URL="[^"]+"/g, `SUPABASE_URL="${ptochLo}"`);
    fs.writeFileSync(envPath, c, "utf8");
    console.log("Updated broker env in:", envPath);
  }
}
