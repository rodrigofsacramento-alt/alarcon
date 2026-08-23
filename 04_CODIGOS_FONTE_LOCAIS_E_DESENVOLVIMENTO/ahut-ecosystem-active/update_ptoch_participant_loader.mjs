import fs from "fs";
import path from "path";

const dirs = [
  "./01_FRONTEND_PRODUCAO_HOSTINGER_BKP",
  "./crm-imobiliaria-producao-BKP"
];

for (const dir of dirs) {
  const assetsDir = path.join(dir, "assets");
  const atendimentoFile = path.join(assetsDir, "Atendimento-live-v6.js");

  if (fs.existsSync(atendimentoFile)) {
    let content = fs.readFileSync(atendimentoFile, "utf8");

    // Clean robust query for group_participants in ptoch
    const oldQuery = `const cleanPhone=(s.client?.phone||"").replace(/\\D/g,"");const jid=cleanPhone+"@g.us";const{data:rawO,error:W}=await B.from("group_participants").select("id, group_id, is_admin, profile:profiles!group_participants_profile_id_fkey(id, full_name, phone, avatar_url)").or("group_id.eq."+s.client.id+",group_id.eq."+cleanPhone+",group_id.eq."+jid);const O=rawO?rawO.map(it=>({participation_id:it.id,group_id:it.group_id,group_role:it.is_admin?"admin":"member",profile_id:it.profile?.id,full_name:it.profile?.full_name||it.profile?.phone||"Membro",phone:it.profile?.phone||"",avatar_url:it.profile?.avatar_url})):[];`;

    const newQuery = `const cleanPhone=(s.client?.phone||"").replace(/\\D/g,"");const jid=cleanPhone+"@g.us";const{data:rawO,error:W}=await B.from("group_participants").select("id, group_id, role, is_admin, profile:profiles!group_participants_profile_id_fkey(id, full_name, phone, avatar_url)").or("group_id.eq."+s.client.id+",group_id.eq."+cleanPhone+",group_id.eq."+jid);const O=rawO?rawO.map(it=>({participation_id:it.id,group_id:it.group_id,group_role:(it.role==="admin"||it.is_admin)?"admin":"member",profile_id:it.profile?.id,full_name:it.profile?.full_name||it.profile?.phone||"Membro",phone:it.profile?.phone||"",avatar_url:it.profile?.avatar_url})):[];`;

    if (content.includes(oldQuery)) {
      content = content.replace(oldQuery, newQuery);
    } else {
      console.log("oldQuery string was slightly different, applying regex patch...");
      content = content.replace(
        /const\{data:rawO,error:W\}=await B\.from\("group_participants"\)[\s\S]*?avatar_url\}\)\):\[\];/,
        newQuery
      );
    }

    fs.writeFileSync(atendimentoFile, content, "utf8");
    console.log("Updated participant loader in:", atendimentoFile);
  }
}
