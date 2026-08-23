import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "JWT_SUPABASE_REDIGIDO";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Let's find out how send_whatsapp_message is defined in PostgreSQL
  // We can query pg_proc or information_schema using an RPC or check tables
  // Wait, let's see how `send_whatsapp_message` works by inspecting what happens when it's called
  // First, find the group from the screenshot: "Lotes para bras..."
  const { data: lotes } = await supabase
    .from('whatsapp_contacts')
    .select('*')
    .ilike('name', '%lote%');
  console.log("Lotes contact:", lotes);

  const { data: convs } = await supabase
    .from('conversations')
    .select('*, client:profiles!conversations_client_id_fkey(*), whatsapp_contact:whatsapp_contacts(*)')
    .limit(20);
  
  const groupConvs = convs.filter(c => 
    c.client?.full_name?.toLowerCase().includes('lote') ||
    c.subject?.toLowerCase().includes('lote') ||
    c.whatsapp_contact?.some(w => w.name?.toLowerCase().includes('lote'))
  );
  console.log("Found Lotes group conversations:", JSON.stringify(groupConvs, null, 2));
}

main().catch(console.error);
