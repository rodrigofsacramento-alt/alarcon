import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "JWT_SUPABASE_REDIGIDO";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("=== Checking Groups in whatsapp_contacts ===");
  const { data: contacts, error: cErr } = await supabase
    .from('whatsapp_contacts')
    .select('*')
    .or('remote_jid.ilike.%@g.us,is_group.eq.true')
    .limit(10);
  
  if (cErr) console.error("contacts error:", cErr);
  else console.log("Group contacts found:", JSON.stringify(contacts, null, 2));

  console.log("\n=== Checking Conversations for Groups ===");
  if (contacts && contacts.length > 0) {
    const convIds = contacts.map(c => c.conversation_id).filter(Boolean);
    const { data: convs, error: convErr } = await supabase
      .from('conversations')
      .select('*, client:profiles!conversations_client_id_fkey(*)')
      .in('id', convIds);
    console.log("Conversations:", JSON.stringify(convs, null, 2));

    console.log("\n=== Checking Messages for group conversations ===");
    for (const cid of convIds) {
      const { data: msgs, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', cid)
        .order('created_at', { ascending: false })
        .limit(5);
      console.log(`Messages for conv ${cid}:`, JSON.stringify(msgs, null, 2));

      const { data: waMsgs, error: waMsgErr } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('conversation_id', cid)
        .order('created_at', { ascending: false })
        .limit(5);
      console.log(`WhatsApp Messages for conv ${cid}:`, JSON.stringify(waMsgs, null, 2));
    }
  }

  console.log("\n=== Recent whatsapp_messages with @g.us ===");
  const { data: groupWaMsgs } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .ilike('remote_jid', '%@g.us%')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log("Recent group whatsapp_messages:", JSON.stringify(groupWaMsgs, null, 2));
}

main().catch(console.error);
