import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.rpc('get_column_default', { table_name: 'leads', col_name: 'product' });
  console.log("RPC result:", data, error);

  // alternatively query postgres info schema
  const { data: cols, error: colsErr } = await supabase.from('leads').select('product').limit(1);
  console.log(cols, colsErr);
}
run();
