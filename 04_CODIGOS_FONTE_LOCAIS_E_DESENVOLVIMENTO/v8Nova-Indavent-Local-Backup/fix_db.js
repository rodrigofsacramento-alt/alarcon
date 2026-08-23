const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Setup env manually without dotenv
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
  console.log('Fetching all messages to check content...');
  
  // get total count
  const { count, error } = await supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true });
  if (error) { console.error('Count error:', error); return; }
  console.log(`Total messages in DB: ${count}`);

  let offset = 0;
  const limit = 1000;
  let updatedCount = 0;

  while (offset < count) {
    const { data: msgs, error: fetchErr } = await supabase
      .from('whatsapp_messages')
      .select('id, metadata, content')
      .range(offset, offset + limit - 1);

    if (fetchErr) {
      console.error('Fetch error:', fetchErr);
      break;
    }

    if (!msgs || msgs.length === 0) break;

    const toUpdate = msgs.filter(m => !m.content || m.content === 'EMPTY' || m.content.trim() === '');
    if (toUpdate.length > 0) {
      console.log(`Found ${toUpdate.length} empty messages in chunk ${offset} to ${offset + limit}`);
    }

    for (const msg of toUpdate) {
      if (!msg.metadata) continue;
      
      const content = msg.metadata.mensagem || msg.metadata.body || msg.metadata.text || '[Sem texto]';
      const sender = msg.metadata.author || msg.metadata.pushName || null;
      
      await supabase
        .from('whatsapp_messages')
        .update({ content: content, sender_name: sender })
        .eq('id', msg.id);
      
      updatedCount++;
    }
    offset += limit;
  }
  
  console.log(`Database fix completed! Updated ${updatedCount} rows.`);
}

run();
