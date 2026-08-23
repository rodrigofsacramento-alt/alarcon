import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ldfcqxeehgaftxsgxkag.supabase.co', 'JWT_SUPABASE_REDIGIDO');
async function test() {
  const { data, error } = await supabase.rpc('get_tables_names_or_something'); 
  // since RPC doesn't exist, let's just query a known table or check swagger?
  // Let's just ask Supabase via REST or postgrest
  const { data: leads } = await supabase.from('leads').select('*').limit(1);
  console.log("Leads has:", leads ? Object.keys(leads[0] || {}) : "no data");
}
test();
