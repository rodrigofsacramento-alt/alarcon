import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('whatsapp_contacts')
    .update({ conversation_id: '7c115458-b23e-4b9f-ac42-90918b730edd' })
    .eq('id', '1f731ff8-6b2e-451b-a31c-afbdfcfe0890')
    .select();
  console.log("Update result:", JSON.stringify(data, null, 2));
  if (error) console.error("Error:", error);
}
run();
