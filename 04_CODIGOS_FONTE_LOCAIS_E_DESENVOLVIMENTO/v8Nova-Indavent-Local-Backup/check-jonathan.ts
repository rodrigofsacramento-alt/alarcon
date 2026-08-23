import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('whatsapp_contacts')
    .select('*')
    .ilike('name', '%Jonathan%');
  console.log("Jonathan in whatsapp_contacts:", JSON.stringify(data, null, 2));
}
run();
