import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const {data: c} = await supabase.from('conversations').select('*').eq('id', 'b093fbb8-adad-4350-805f-feef8c70d8d6'); 
  console.log('Conversations:', c);
  
  if (c && c.length > 0) {
     const phone = c[0].phone;
     const {data: leads} = await supabase.from('leads').select('*').eq('phone', phone);
     console.log('Leads for this phone:', leads);
     const {data: profiles} = await supabase.from('profiles').select('*').eq('phone', phone);
     console.log('Profiles for this phone:', profiles);
  }
}
run();
