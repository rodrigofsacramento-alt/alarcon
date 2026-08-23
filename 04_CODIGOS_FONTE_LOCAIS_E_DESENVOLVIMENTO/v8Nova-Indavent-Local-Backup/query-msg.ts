import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data: msg, error} = await supabase.from('whatsapp_messages').select('*').eq('whatsapp_message_id', '3AD2E7C7336DBC4B0E62'); 
  console.log('Error:', error);
  console.log('Message:', msg);
}
run();
