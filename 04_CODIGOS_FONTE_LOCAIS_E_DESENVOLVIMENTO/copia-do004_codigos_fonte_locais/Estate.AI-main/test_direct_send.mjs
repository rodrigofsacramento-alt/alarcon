import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "JWT_SUPABASE_REDIGIDO";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testSend(conversationId, content) {
  console.log(`Sending to conv ${conversationId}: "${content}"`);
  
  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('id, tenant_id, client_id, agent_id, client:profiles!conversations_client_id_fkey(id, phone, full_name)')
    .eq('id', conversationId)
    .single();
  if (convErr) throw convErr;

  const { data: contacts } = await supabase
    .from('whatsapp_contacts')
    .select('id, remote_jid, phone_number, profile_id, is_group')
    .eq('conversation_id', conversationId)
    .limit(1);

  const contact = contacts?.[0];
  const remoteJid = contact?.remote_jid || (contact?.phone_number ? `${contact.phone_number}@s.whatsapp.net` : null);

  const { data: session } = await supabase
    .from('whatsapp_sessions')
    .select('id, tenant_id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 1. Insert into messages
  const { data: msg, error: msgErr } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: conv.agent_id || conv.client_id,
      receiver_id: contact?.is_group ? null : conv.client_id,
      content: content,
      message_type: 'text',
      is_read: true,
    })
    .select()
    .single();

  if (msgErr) throw msgErr;
  console.log("Inserted message:", msg);

  // 2. Insert into whatsapp_messages
  if (remoteJid) {
    const { data: waMsg, error: waErr } = await supabase
      .from('whatsapp_messages')
      .insert({
        tenant_id: conv.tenant_id || session?.tenant_id,
        whatsapp_session_id: session?.id || null,
        conversation_id: conversationId,
        remote_jid: remoteJid,
        from_me: true,
        content: content,
        message_type: 'text',
        status: 'pending',
      })
      .select()
      .single();
    if (waErr) throw waErr;
    console.log("Queued whatsapp_message:", waMsg);
  }

  // 3. Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);
  
  console.log("Successfully sent and recorded!");
}

async function main() {
  const groupId = "2f68bda7-3d63-4e28-abfc-7047198f341d"; // "Comercial e ADM"
  await testSend(groupId, "Mensagem de teste de envio no grupo");
}

main().catch(console.error);
