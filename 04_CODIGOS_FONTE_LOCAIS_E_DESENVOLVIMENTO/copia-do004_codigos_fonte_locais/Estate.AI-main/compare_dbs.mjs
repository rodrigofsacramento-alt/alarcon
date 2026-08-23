import { createClient } from '@supabase/supabase-js';

const url1 = 'https://ldfcqxeehgaftxsgxkag.supabase.co';
const key1 = 'JWT_SUPABASE_REDIGIDO';

const url2 = 'https://ptochsyoyatsydfysacc.supabase.co';
const key2 = 'SUPABASE_KEY_REDIGIDO_Jl_jbSWy';

async function main() {
  console.log("=== DB 1 (ldfcqxeehgaftxsgxkag) ===");
  const sb1 = createClient(url1, key1);
  const { data: s1 } = await sb1.from('whatsapp_sessions').select('*');
  console.log("Sessions DB1:", s1);

  console.log("\n=== DB 2 (ptochsyoyatsydfysacc) ===");
  const sb2 = createClient(url2, key2);
  const { data: s2, error: e2 } = await sb2.from('whatsapp_sessions').select('*');
  console.log("Sessions DB2:", s2, "Error:", e2);
}

main().catch(console.error);
