import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('leads').select('*, propostas(*)').limit(1);
  if (error) console.error("Error fetching leads with propostas:", error);
  else console.log("Success fetching leads with propostas");
}
run();
