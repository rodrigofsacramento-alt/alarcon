import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!
);

async function check() {
  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .select('*');
  console.log('SESSIONS:', data, 'ERROR:', error);
}

check();
