import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ldfcqxeehgaftxsgxkag.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "JWT_SUPABASE_REDIGIDO";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("=== ALL WHATSAPP SESSIONS ===");
  const { data: sessions } = await supabase.from('whatsapp_sessions').select('*');
  console.log(sessions);

  console.log("\n=== PROFILES FOR JOAO MARTINS & IGOR ===");
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, tenant_id')
    .or('full_name.ilike.%João%,full_name.ilike.%Igor%,email.ilike.%admin%');
  console.log(profiles);
}

main().catch(console.error);
