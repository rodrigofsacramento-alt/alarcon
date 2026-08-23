import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.from('messages').select('*').limit(5);
  console.log("MESSAGES (Anon Role):", JSON.stringify(data, null, 2));
  if (error) console.error("ERROR:", error);
}

run();
