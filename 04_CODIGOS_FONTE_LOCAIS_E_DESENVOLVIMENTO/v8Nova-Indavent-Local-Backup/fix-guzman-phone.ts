import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('leads')
    .update({ product: null })
    .ilike('phone', '%11915306257%')
    .select('name, phone, product');
    
  console.log("Update Guzman product:", data, error);
}
run();
