import fs from "fs";
import path from "path";

const dirs = [
  "./01_FRONTEND_PRODUCAO_HOSTINGER_BKP",
  "./crm-imobiliaria-producao-BKP"
];

for (const dir of dirs) {
  const assetsDir = path.join(dir, "assets");

  // 1. Disable Cd and Ed in index-live-v5.js
  const indexFile = path.join(assetsDir, "index-live-v5.js");
  if (fs.existsSync(indexFile)) {
    let code = fs.readFileSync(indexFile, "utf8");

    // Replace Cd function body with return null;
    const cdStart = "function Cd(){const{isOpen:e,activeView:t,closePanel:n}=ct();";
    const cdEnd = `className:"h-4 w-4"})})]})})]})]}:null}`;
    const cdStartIdx = code.indexOf(cdStart);
    const cdEndIdx = code.indexOf(cdEnd);
    if (cdStartIdx !== -1 && cdEndIdx !== -1) {
      code = code.substring(0, cdStartIdx) + "function Cd(){return null;}" + code.substring(cdEndIdx + cdEnd.length);
      console.log("Disabled Cd (Print 1 GroupDrawer) in:", indexFile);
    } else {
      console.log("Cd markers not found directly, using regex replacement...");
      code = code.replace(/function Cd\(\)\{[\s\S]*?className:"h-4 w-4"\}\)\}\)\}\]\)\}\)\}\]\)\}\]:null\}/g, "function Cd(){return null;}");
    }

    fs.writeFileSync(indexFile, code, "utf8");
  }

  // 2. In Atendimento-live-v5.js, remove ja.getState().openPanel
  const atendimentoFile = path.join(assetsDir, "Atendimento-live-v5.js");
  if (fs.existsSync(atendimentoFile)) {
    let code = fs.readFileSync(atendimentoFile, "utf8");
    code = code.replace(/onClick:\(\)=>ja\.getState\(\)\.openPanel\([^)]+\)/g, 'onClick:()=>console.log("Panel disabled in favor of right sidebar")');
    fs.writeFileSync(atendimentoFile, code, "utf8");
    console.log("Removed openPanel triggers from:", atendimentoFile);
  }
}
