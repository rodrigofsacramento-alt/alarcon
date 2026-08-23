import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: s, error: es } = await supabase.from('whatsapp_sessions').select('*');
  const { data: c, error: ec } = await supabase.from('whatsapp_contacts').select('*');
  console.log("Sessions:", JSON.stringify({ data: s, error: es }, null, 2));
  console.log("Contacts:", JSON.stringify({ data: c, error: ec }, null, 2));
}
test();
