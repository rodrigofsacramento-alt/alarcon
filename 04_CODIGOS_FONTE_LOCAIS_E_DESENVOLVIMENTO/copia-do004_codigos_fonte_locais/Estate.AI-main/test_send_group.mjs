import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "JWT_SUPABASE_REDIGIDO";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const groupId = "2f68bda7-3d63-4e28-abfc-7047198f341d"; // "Comercial e ADM"
  
  // Check whatsapp_contacts for this group
  const { data: contact } = await supabase
    .from('whatsapp_contacts')
    .select('*')
    .eq('conversation_id', groupId);
  console.log("Contact for group:", contact);

  // Check what happens when calling send_whatsapp_message (or inspect the function)
  // Let's check the SQL definition of send_whatsapp_message in pg_proc if possible
  const { data: rpcRes, error: rpcErr } = await supabase
    .rpc('send_whatsapp_message', {
      p_conversation_id: groupId,
      p_content: 'TEST_DIAGNOSTIC_MESSAGE'
    });
  console.log("send_whatsapp_message result:", rpcRes, "error:", rpcErr);

  // Check what was inserted in messages and whatsapp_messages
  const { data: msgs } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', groupId)
    .order('created_at', { ascending: false })
    .limit(2);
  console.log("Latest messages in messages table:", msgs);

  const { data: waMsgs } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('conversation_id', groupId)
    .order('created_at', { ascending: false })
    .limit(2);
  console.log("Latest whatsapp_messages in DB:", waMsgs);
}

main().catch(console.error);
