import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data} = await supabase.from('leads').select('*').limit(1);
  console.log('Lead columns:', data && data.length > 0 ? Object.keys(data[0]) : 'no leads');
}
run();
