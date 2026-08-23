import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data: p} = await supabase.from('profiles').select('*').eq('id', 'cae7841c-e55d-4a3c-a06e-31b0f0527fff'); 
  console.log('Profile:', p);
}
run();
