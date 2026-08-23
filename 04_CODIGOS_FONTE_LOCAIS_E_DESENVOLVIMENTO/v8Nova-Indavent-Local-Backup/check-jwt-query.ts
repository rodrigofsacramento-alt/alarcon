import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'alex.indavent@gmail.com', // wait, admin doesn't have email in internal_users?
  });
  
  // wait, the app uses custom auth or Supabase Auth?
  // Let's check useAuth.ts!
}
run();
