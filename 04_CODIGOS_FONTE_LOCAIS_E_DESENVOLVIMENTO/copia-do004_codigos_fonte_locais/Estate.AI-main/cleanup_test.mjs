import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "JWT_SUPABASE_REDIGIDO";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  await supabase.from('messages').delete().eq('content', 'Mensagem de teste de envio no grupo');
  await supabase.from('whatsapp_messages').delete().eq('content', 'Mensagem de teste de envio no grupo');
  console.log("Cleaned up test messages.");
}

main().catch(console.error);
