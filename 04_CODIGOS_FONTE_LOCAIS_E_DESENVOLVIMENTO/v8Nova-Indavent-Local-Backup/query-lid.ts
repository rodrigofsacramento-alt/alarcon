import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data} = await supabase.from('leads').select('id, name, phone').like('phone', '%726500%'); 
  console.log('Leads:', data); 
  const {data: c} = await supabase.from('conversations').select('id, phone, title').like('phone', '%72650%'); 
  console.log('Conversations:', c);
}
run();
