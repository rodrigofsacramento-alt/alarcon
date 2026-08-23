import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .ilike('content', '%teste broker%')
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log("Recent messages:", JSON.stringify(data, null, 2));
  if (error) console.error(error);
}
run();
