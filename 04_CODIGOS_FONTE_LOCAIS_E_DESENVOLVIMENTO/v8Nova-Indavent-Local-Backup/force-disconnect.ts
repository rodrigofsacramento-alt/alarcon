import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('whatsapp_sessions').update({ status: 'disconnected', qr_code: null }).eq('id', '30575b60-f571-4d80-aec8-3a422d7870c7').select('status, qr_code, last_error, updated_at');
  console.log('Updated:', data, error);
}
run();
