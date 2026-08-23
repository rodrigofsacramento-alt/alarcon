import fs from "fs";
import path from "path";

const dirs = [
  "./01_FRONTEND_PRODUCAO_HOSTINGER_BKP",
  "./crm-imobiliaria-producao-BKP"
];

const newIndexName = "index-v3-M71X.js";
const newAtendimentoName = "Atendimento-v3-N28Y.js";
const ldfLo = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const ldfDo = "JWT_SUPABASE_REDIGIDO";

for (const dir of dirs) {
  const assetsDir = path.join(dir, "assets");
  let indexJs = fs.readFileSync(path.join(assetsDir, "index-C9-68P_N.js"), "utf8");
  let atendimentoJs = fs.readFileSync(path.join(assetsDir, "Atendimento-DcqAjCvf.js"), "utf8");

  // 1. In index.js replace reference to Atendimento
  indexJs = indexJs.replace(/Atendimento-DcqAjCvf\.js(\?v=[^"'\`]+)?/g, newAtendimentoName);
  indexJs = indexJs.replace(/Atendimento-v2-P42Q\.js(\?v=[^"'\`]+)?/g, newAtendimentoName);
  indexJs = indexJs.replace(/const Lo="https:\/\/[^"]+",Do="[^"]+"/g, `const Lo="${ldfLo}",Do="${ldfDo}"`);

  // 2. Fix the non-existent email column in profiles queries!
  indexJs = indexJs.replace(
    `client:profiles!conversations_client_id_fkey(id, full_name, email, phone, avatar_url),`,
    `client:profiles!conversations_client_id_fkey(id, full_name, phone, avatar_url),`
  );
  indexJs = indexJs.replace(
    `agent:profiles!conversations_agent_id_fkey(id, full_name, email, phone, avatar_url),`,
    `agent:profiles!conversations_agent_id_fkey(id, full_name, phone, avatar_url),`
  );

  // 3. Ensure AuthProvider never blocks
  indexJs = indexJs.replace(
    `const[l,d]=c.useState(!0),[u,m]=c.useState(!0),[p,h]=c.useState(null);c.useEffect(()=>{let v=!1;`,
    `const[l,d]=c.useState(!0),[u,m]=c.useState(!0),[p,h]=c.useState(null);c.useEffect(()=>{let v=!1;setTimeout(()=>{if(!v){d(!1);m(!1);}},1200);`
  );

  // 4. Update index.html
  let indexHtml = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  indexHtml = indexHtml.replace(/src="\/assets\/index-[^"]+"/g, `src="/assets/${newIndexName}"`);
  indexHtml = indexHtml.replace(/src="\/assets\/index-v2-[^"]+"/g, `src="/assets/${newIndexName}"`);

  fs.writeFileSync(path.join(assetsDir, newIndexName), indexJs, "utf8");
  fs.writeFileSync(path.join(assetsDir, newAtendimentoName), atendimentoJs, "utf8");
  fs.writeFileSync(path.join(dir, "index.html"), indexHtml, "utf8");

  console.log("Updated directory:", dir);
}
