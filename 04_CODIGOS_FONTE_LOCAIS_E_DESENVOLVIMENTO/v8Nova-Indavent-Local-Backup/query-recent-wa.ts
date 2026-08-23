import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data} = await supabase.from('whatsapp_messages').select('*').order('created_at', {ascending: false}).limit(10);
  console.log('Recent whatsapp messages:', data);
}
run();
