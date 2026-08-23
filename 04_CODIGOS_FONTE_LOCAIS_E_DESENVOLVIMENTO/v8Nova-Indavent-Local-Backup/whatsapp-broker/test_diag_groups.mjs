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
  else console.log("Group contacts found:", contacts);

  console.log("\n=== Checking Conversations for Groups ===");
  if (contacts && contacts.length > 0) {
    const convIds = contacts.map(c => c.conversation_id).filter(Boolean);
    const { data: convs, error: convErr } = await supabase
      .from('conversations')
      .select('*, client:profiles!conversations_client_id_fkey(*)')
      .in('id', convIds);
    console.log("Conversations:", convs);

    console.log("\n=== Checking Messages for first group conversation ===");
    for (const cid of convIds.slice(0, 3)) {
      const { data: msgs, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', cid)
        .order('created_at', { ascending: false })
        .limit(5);
      console.log(`Messages for conv ${cid}:`, msgs);

      const { data: waMsgs, error: waMsgErr } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('conversation_id', cid)
        .order('created_at', { ascending: false })
        .limit(5);
      console.log(`WhatsApp Messages for conv ${cid}:`, waMsgs);
    }
  }

  // Also query recent messages across all conversations
  console.log("\n=== Recent 10 messages across all tables ===");
  const { data: recentMsgs } = await supabase
    .from('messages')
    .select('id, conversation_id, content, sender_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log("Recent messages:", recentMsgs);

  const { data: recentWaMsgs } = await supabase
    .from('whatsapp_messages')
    .select('id, conversation_id, remote_jid, content, from_me, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log("Recent whatsapp_messages:", recentWaMsgs);
}

main().catch(console.error);
