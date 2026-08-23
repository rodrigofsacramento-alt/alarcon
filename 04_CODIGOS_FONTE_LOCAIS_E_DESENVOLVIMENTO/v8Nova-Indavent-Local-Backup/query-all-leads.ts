import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data: leads} = await supabase.from('leads').select('*').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); 
  console.log('Leads created in last 24h:', leads);
}
run();
