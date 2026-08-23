import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "JWT_SUPABASE_REDIGIDO";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("=== ALL TENANTS ===");
  const { data: tenants } = await supabase.from('tenants').select('*');
  console.log(tenants);

  console.log("\n=== ALL WHATSAPP SESSIONS ===");
  const { data: sessions } = await supabase.from('whatsapp_sessions').select('*');
  console.log(sessions);

  console.log("\n=== RECENT WHATSAPP CONTACTS (TOP 20) ===");
  const { data: contacts } = await supabase
    .from('whatsapp_contacts')
    .select('id, tenant_id, phone_number, name, remote_jid, is_group, last_message_at')
    .order('last_message_at', { ascending: false })
    .limit(20);
  console.log(contacts);
}

main().catch(console.error);
