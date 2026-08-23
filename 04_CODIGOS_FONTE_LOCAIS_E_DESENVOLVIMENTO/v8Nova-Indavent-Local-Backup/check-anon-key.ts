import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use ANON KEY instead of service role
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.from('leads').select('*').ilike('name', '%Jonathan%');
  console.log("Leads encontrados (ANON KEY):", JSON.stringify(data, null, 2));
  console.log("Erro:", error);
}
run();
