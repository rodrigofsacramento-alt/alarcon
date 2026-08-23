import fs from "fs";

const brokerFile = "./ahut-whatsapp-broker/dist/session-manager.js";

if (fs.existsSync(brokerFile)) {
  let code = fs.readFileSync(brokerFile, "utf8");

  const syncFunc = `
async function syncAllWhatsAppGroups(sock, tenantId) {
  try {
    logger.info({ tenantId }, 'Iniciando sincronizacao de grupos e todos os participantes do WhatsApp...');
    if (!sock.groupFetchAllParticipating) return;
    const groups = await sock.groupFetchAllParticipating();
    if (!groups) return;
    const groupJids = Object.keys(groups);
    logger.info({ tenantId, totalGroups: groupJids.length }, 'Grupos retornados pelo WhatsApp');

    for (const jid of groupJids) {
      const g = groups[jid];
      if (!g) continue;
      const cleanPhone = jid.split('@')[0];
      const subject = g.subject || 'Grupo WhatsApp';

      let { data: groupProfile } = await supabase.from('profiles').select('id').eq('phone', cleanPhone).maybeSingle();
      if (!groupProfile) {
        const { data: newP } = await supabase.from('profiles').insert({
          tenant_id: tenantId,
          full_name: subject,
          phone: cleanPhone,
          role: 'client'
        }).select('id').maybeSingle();
        groupProfile = newP;
      } else {
        await supabase.from('profiles').update({ full_name: subject }).eq('id', groupProfile.id);
      }

      let { data: conv } = await supabase.from('conversations').select('id').eq('client_id', groupProfile?.id).maybeSingle();
      if (!conv && groupProfile?.id) {
        const { data: newConv } = await supabase.from('conversations').insert({
          tenant_id: tenantId,
          client_id: groupProfile.id,
          subject: subject,
          status: 'open',
          is_group: true
        }).select('id').maybeSingle();
        conv = newConv;
      }

      await supabase.from('whatsapp_contacts').upsert({
        tenant_id: tenantId,
        phone_number: cleanPhone,
        remote_jid: jid,
        name: subject,
        is_group: true,
        conversation_id: conv?.id || null,
        last_message_at: new Date()
      }, { onConflict: 'tenant_id,phone_number' });

      if (Array.isArray(g.participants)) {
        logger.info({ jid, subject, count: g.participants.length }, 'Importando participantes do grupo...');
        for (const p of g.participants) {
          const pPhone = p.id.split('@')[0].split(':')[0];
          if (!pPhone) continue;
          let { data: pProf } = await supabase.from('profiles').select('id').eq('phone', pPhone).maybeSingle();
          if (!pProf) {
            const { data: newProf } = await supabase.from('profiles').insert({
              tenant_id: tenantId,
              phone: pPhone,
              full_name: pPhone,
              role: 'client'
            }).select('id').maybeSingle();
            pProf = newProf;
          }
          if (pProf?.id) {
            await supabase.from('group_participants').upsert({
              tenant_id: tenantId,
              group_id: jid,
              profile_id: pProf.id,
              is_admin: p.admin === 'admin' || p.admin === 'superadmin'
            }, { onConflict: 'group_id,profile_id' });
          }
        }
      }
    }
    logger.info({ tenantId }, 'Sincronizacao de grupos finalizada com sucesso!');
  } catch (err) {
    logger.warn({ err: err.message }, 'Erro ao sincronizar grupos e participantes');
  }
}
`;

  // Insert syncFunc before ensureGroupParticipant
  if (!code.includes("async function syncAllWhatsAppGroups")) {
    code = code.replace("async function ensureGroupParticipant", syncFunc + "\nasync function ensureGroupParticipant");
  }

  // Trigger syncAllWhatsAppGroups when connection opens
  const openHookOld = `connection === 'open') {
            logger.info({ tenant: session.tenant_id }, 'Conexao aberta');`;
  const openHookNew = `connection === 'open') {
            logger.info({ tenant: session.tenant_id }, 'Conexao aberta');
            syncAllWhatsAppGroups(sock, session.tenant_id).catch(e => logger.warn({ err: e.message }, 'Erro syncAllWhatsAppGroups'));`;

  code = code.replace(openHookOld, openHookNew);

  fs.writeFileSync(brokerFile, code, "utf8");
  console.log("Patched session-manager.js with syncAllWhatsAppGroups!");
}
