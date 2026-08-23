require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('whatsapp_messages').select('metadata').order('timestamp', { ascending: false }).limit(2);
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}
run();
