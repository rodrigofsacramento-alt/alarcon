import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const query = `
    GRANT ALL ON public.tenants TO anon, authenticated;
    GRANT ALL ON public.profiles TO anon, authenticated;
    GRANT ALL ON public.conversations TO anon, authenticated;
    GRANT ALL ON public.whatsapp_sessions TO anon, authenticated;
    GRANT ALL ON public.whatsapp_messages TO anon, authenticated;
    GRANT ALL ON public.whatsapp_contacts TO anon, authenticated;
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql: query });
  if (error) {
    console.log("No exec_sql RPC found. We can't run raw SQL from JS client. The user must run it in Supabase.");
  }
}
fix();
