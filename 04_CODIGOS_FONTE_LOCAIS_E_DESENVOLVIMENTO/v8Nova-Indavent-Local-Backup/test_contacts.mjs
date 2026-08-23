import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('whatsapp_contacts').select('*').limit(1);
  console.log("whatsapp_contacts:", { data, error });
  
  const { data: conv, error: e2 } = await supabase.from('conversations').select('*').limit(1);
  console.log("conversations:", { data: conv, error: e2 });
}
test();
