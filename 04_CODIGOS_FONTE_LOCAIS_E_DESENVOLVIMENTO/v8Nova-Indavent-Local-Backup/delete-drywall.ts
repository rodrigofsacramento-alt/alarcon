import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('leads').delete().eq('id', '2a7e4889-0d73-80a3-8c99-ccdaa805d9ed'); 
  if (error) {
    console.error('Error deleting lead:', error);
  } else {
    console.log('Successfully deleted lead Loja Drywall ABC');
  }
}
run();
