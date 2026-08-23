import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('whatsapp_contacts').select('*, conversations(agent_id, status)').limit(2);
  console.log("whatsapp_contacts with conversations:", JSON.stringify(data, null, 2), error);
}
run();
