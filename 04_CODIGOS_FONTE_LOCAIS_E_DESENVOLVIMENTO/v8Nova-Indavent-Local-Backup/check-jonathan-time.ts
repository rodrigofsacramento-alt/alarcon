import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: lead, error: leadErr } = await supabase.from('leads').select('*').ilike('name', '%Jonathan%');
  console.log("Lead:", JSON.stringify(lead, null, 2));

  const { data: profile, error: profErr } = await supabase.from('profiles').select('created_at, updated_at').eq('id', 'c9b9b9a1-5bef-4518-8385-e4bdeeb1d9bd');
  console.log("Profile:", JSON.stringify(profile, null, 2));
}
run();
