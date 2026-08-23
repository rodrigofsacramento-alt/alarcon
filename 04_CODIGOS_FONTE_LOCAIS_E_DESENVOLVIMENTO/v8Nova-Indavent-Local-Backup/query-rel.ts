import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('conversations').select('id, agent_id, whatsapp_contacts(id, name)').limit(1);
  console.log("Relationship conversations->whatsapp_contacts:", data, error);
}
run();
