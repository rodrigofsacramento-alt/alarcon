import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', '7c115458-b23e-4b9f-ac42-90918b730edd');
  console.log("Conversation:", JSON.stringify(data, null, 2));
}
run();
