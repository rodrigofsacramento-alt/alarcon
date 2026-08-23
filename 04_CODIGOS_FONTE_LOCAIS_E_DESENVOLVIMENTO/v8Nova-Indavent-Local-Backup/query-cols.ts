import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data: conv} = await supabase.from('conversations').select('*').limit(1);
  console.log('Conversations cols:', conv && conv.length > 0 ? Object.keys(conv[0]) : 'no data');
  
  const {data: wac} = await supabase.from('whatsapp_contacts').select('*').limit(1);
  console.log('whatsapp_contacts cols:', wac && wac.length > 0 ? Object.keys(wac[0]) : 'no data');
}
run();
