import fs from "fs";
import path from "path";

const dirs = [
  "./01_FRONTEND_PRODUCAO_HOSTINGER_BKP",
  "./crm-imobiliaria-producao-BKP"
];

for (const dir of dirs) {
  const assetsDir = path.join(dir, "assets");

  // 1. Optimize use-leads: select lightweight fields and cache for 2 minutes
  const leadsFile = path.join(assetsDir, "use-leads-Dgo3FHYA.js");
  if (fs.existsSync(leadsFile)) {
    let code = fs.readFileSync(leadsFile, "utf8");
    code = code.replace(
      `queryFn:async()=>{const{data:t,error:n}=await s.from("leads").select("*, responsible:profiles!leads_responsible_id_fkey(*)")`,
      `staleTime:120000,queryFn:async()=>{const{data:t,error:n}=await s.from("leads").select("id, phone, stage, next_action, responsible_id, name, created_at, last_interaction")`
    );
    fs.writeFileSync(leadsFile, code, "utf8");
    console.log("Optimized use-leads in:", dir);
  }

  // 2. Optimize index-live-v5.js: add staleTime to conversations and remove aggressive invalidateQueries
  const indexFile = path.join(assetsDir, "index-live-v5.js");
  if (fs.existsSync(indexFile)) {
    let code = fs.readFileSync(indexFile, "utf8");
    
    // Add staleTime to conversations query (15s)
    code = code.replace(
      `queryKey:["conversations",e,t],enabled:!!e,`,
      `queryKey:["conversations",e,t],enabled:!!e,staleTime:15000,gcTime:300000,`
    );

    // In useMessages realtime listener: don't invalidate entire conversations query on every message tick
    code = code.replace(
      `t.invalidateQueries({queryKey:["messages",e]}),t.invalidateQueries({queryKey:["conversations"]})`,
      `t.invalidateQueries({queryKey:["messages",e]})`
    );

    fs.writeFileSync(indexFile, code, "utf8");
    console.log("Optimized index-live-v5 in:", dir);
  }

  // 3. Optimize Atendimento-live-v5.js: eliminate visits query retry loop and optimize re-renders
  const atendimentoFile = path.join(assetsDir, "Atendimento-live-v5.js");
  if (fs.existsSync(atendimentoFile)) {
    let code = fs.readFileSync(atendimentoFile, "utf8");

    // Replace visits query with static empty array
    code = code.replace(
      `{data:vs=[]}=In(!!j)`,
      `vs=[]`
    );

    fs.writeFileSync(atendimentoFile, code, "utf8");
    console.log("Optimized Atendimento-live-v5 in:", dir);
  }
}
