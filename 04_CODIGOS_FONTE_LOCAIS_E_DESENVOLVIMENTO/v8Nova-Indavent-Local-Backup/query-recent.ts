import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data: leads} = await supabase.from('leads').select('id, name, phone').order('created_at', { ascending: false }).limit(5); 
  console.log('Recent Leads:', leads);
}
run();
