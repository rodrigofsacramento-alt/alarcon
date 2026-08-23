import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data: msgs} = await supabase.from('messages').select('*').eq('conversation_id', 'b093fbb8-adad-4350-805f-feef8c70d8d6'); 
  console.log('CRM Messages:', msgs);
}
run();
