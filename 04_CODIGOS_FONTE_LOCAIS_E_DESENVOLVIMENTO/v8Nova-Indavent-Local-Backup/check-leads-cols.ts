import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  console.log("Data:", data);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  }
}
run();
