import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data: msgs, error} = await supabase.from('whatsapp_messages')
    .select('id, content, remote_jid, from_me, created_at')
    .ilike('content', '%tests envio de mensagem via sistema%'); 
  console.log('Error:', error);
  console.log('Messages:', msgs);
}
run();
