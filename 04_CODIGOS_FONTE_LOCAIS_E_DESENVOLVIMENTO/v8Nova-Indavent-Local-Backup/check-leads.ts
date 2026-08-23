import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  if (error) console.error("Error fetching lead:", error);
  if (data) {
    if (data.length > 0) {
      console.log("Lead keys:", Object.keys(data[0]));
    } else {
      console.log("No leads found, let's insert a dummy one or check schema via dummy insert");
      const { error: insErr } = await supabase.from('leads').insert({ tenant_id: '123' }).select();
      console.log("Insert error (for schema info):", insErr);
    }
  }
}
run();
