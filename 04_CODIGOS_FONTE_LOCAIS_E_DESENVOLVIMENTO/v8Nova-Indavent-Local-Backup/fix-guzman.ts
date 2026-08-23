import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { error } = await supabase
    .from('leads')
    .update({ product: null })
    .ilike('name', '%Guzman%');
    
  console.log("Update Guzman product:", error);
}
run();
