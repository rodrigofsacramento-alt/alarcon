import fs from "fs";
import path from "path";

const dirs = [
  "./01_FRONTEND_PRODUCAO_HOSTINGER_BKP",
  "./crm-imobiliaria-producao-BKP"
];

for (const dir of dirs) {
  const assetsDir = path.join(dir, "assets");
  const atendimentoFile = path.join(assetsDir, "Atendimento-live-v5.js");

  if (fs.existsSync(atendimentoFile)) {
    let content = fs.readFileSync(atendimentoFile, "utf8");

    // Replace uo participant fetch query with direct group_participants query
    const oldQuery = `const{data:O,error:W}=await B.from("vw_group_participants").select("*").eq("group_id",s.client.id);`;
    const newQuery = `const cleanPhone=(s.client?.phone||"").replace(/\\D/g,"");const jid=cleanPhone+"@g.us";const{data:rawO,error:W}=await B.from("group_participants").select("id, group_id, is_admin, profile:profiles!group_participants_profile_id_fkey(id, full_name, phone, avatar_url)").or("group_id.eq."+s.client.id+",group_id.eq."+cleanPhone+",group_id.eq."+jid);const O=rawO?rawO.map(it=>({participation_id:it.id,group_id:it.group_id,group_role:it.is_admin?"admin":"member",profile_id:it.profile?.id,full_name:it.profile?.full_name||it.profile?.phone||"Membro",phone:it.profile?.phone||"",avatar_url:it.profile?.avatar_url})):[];`;

    content = content.replace(oldQuery, newQuery);

    fs.writeFileSync(atendimentoFile, content, "utf8");
    console.log("Updated participant loader in:", atendimentoFile);
  }
}
