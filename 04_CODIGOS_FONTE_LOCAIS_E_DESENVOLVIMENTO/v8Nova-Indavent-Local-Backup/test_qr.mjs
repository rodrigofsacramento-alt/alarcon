import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('whatsapp_sessions').select('qr_code').limit(1).single();
  const qr = data?.qr_code;
  console.log("QR Length:", qr?.length);
  console.log("QR starts with:", qr?.substring(0, 50));
}
test();
