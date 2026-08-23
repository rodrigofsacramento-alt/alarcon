import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('whatsapp_sessions').update({ status: 'disconnected' }).eq('tenant_id', '17ee4673-ace6-4b3f-926c-1702486a03f0');
  console.log('Updated session status:', error || data);
}
run();
