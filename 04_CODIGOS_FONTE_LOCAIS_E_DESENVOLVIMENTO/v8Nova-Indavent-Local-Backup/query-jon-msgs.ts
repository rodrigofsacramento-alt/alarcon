import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data: msgs} = await supabase.from('whatsapp_messages')
    .select('id, content, remote_jid, created_at')
    .ilike('remote_jid', '%915306257%'); 
  console.log('Messages from Jonathan:', msgs);
}
run();
