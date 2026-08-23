import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "JWT_SUPABASE_REDIGIDO";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: convs, error } = await supabase
    .from('conversations')
    .select('*, client:profiles!conversations_client_id_fkey(*)')
    .order('last_message_at', { ascending: false });
  
  if (error) console.error(error);
  else console.log("Total conversations:", convs.length, convs.map(c => ({ id: c.id, name: c.client?.full_name, phone: c.client?.phone, last_msg: c.last_message_at })));
}

main().catch(console.error);
