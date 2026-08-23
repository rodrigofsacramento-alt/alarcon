import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "JWT_SUPABASE_REDIGIDO";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // 1. Search for contacts matching "Lotes"
  console.log("=== Contacts matching Lotes ===");
  const { data: lotesContacts } = await supabase
    .from('whatsapp_contacts')
    .select('*')
    .ilike('name', '%Lotes%');
  console.log("Lotes Contacts:", JSON.stringify(lotesContacts, null, 2));

  // 2. Search for all @g.us contacts
  console.log("=== All @g.us Contacts ===");
  const { data: groupContacts } = await supabase
    .from('whatsapp_contacts')
    .select('id, tenant_id, profile_id, conversation_id, remote_jid, phone_number, name, is_group')
    .ilike('remote_jid', '%@g.us%');
  console.log("All Group Contacts:", JSON.stringify(groupContacts, null, 2));

  // 3. For each group contact, check conversation and recent messages
  if (groupContacts && groupContacts.length > 0) {
    for (const gc of groupContacts) {
      console.log(`\n--- Group: ${gc.name} (conv: ${gc.conversation_id}, jid: ${gc.remote_jid}) ---`);
      if (gc.conversation_id) {
        const { data: conv } = await supabase
          .from('conversations')
          .select('*, client:profiles!conversations_client_id_fkey(*)')
          .eq('id', gc.conversation_id)
          .single();
        console.log("Conversation:", conv);

        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', gc.conversation_id)
          .order('created_at', { ascending: false })
          .limit(5);
        console.log("Messages in messages table:", msgs);

        const { data: waMsgs } = await supabase
          .from('whatsapp_messages')
          .select('*')
          .eq('conversation_id', gc.conversation_id)
          .order('created_at', { ascending: false })
          .limit(5);
        console.log("Messages in whatsapp_messages table:", waMsgs);
      }
    }
  }

  // 4. Check whatsapp_messages where remote_jid is @g.us but conversation_id might be different or null
  console.log("\n=== Recent whatsapp_messages with @g.us ===");
  const { data: recentWaGroupMsgs } = await supabase
    .from('whatsapp_messages')
    .select('id, conversation_id, remote_jid, from_me, content, created_at, status')
    .ilike('remote_jid', '%@g.us%')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log("Recent WA Group Messages:", JSON.stringify(recentWaGroupMsgs, null, 2));
}

main().catch(console.error);
