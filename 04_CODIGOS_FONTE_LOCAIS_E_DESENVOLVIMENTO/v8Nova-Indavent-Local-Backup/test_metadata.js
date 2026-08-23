const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function run() {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('metadata, content, sender_name')
    .order('timestamp', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(JSON.stringify(data, null, 2));
}

run();
