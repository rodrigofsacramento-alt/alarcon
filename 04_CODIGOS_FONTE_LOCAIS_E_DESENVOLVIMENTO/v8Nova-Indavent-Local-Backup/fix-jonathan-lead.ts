import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: contact, error: contErr } = await supabase.from('whatsapp_contacts').select('*').ilike('name', '%Jonathan%').single();
  
  if (!contact) {
    console.log("Contato não encontrado", contErr);
    return;
  }
  
  console.log("Inserindo lead para:", contact.name);
  
  const { error: insertErr } = await supabase.from('leads').insert({
    name: contact.name,
    phone: contact.phone,
    source_details: 'whatsapp',
    stage: 'Cadastrado'
  });
  
  if (insertErr) {
    console.log("Erro ao inserir:", insertErr);
  } else {
    console.log("Lead Jonathan criado com sucesso!");
  }
}
run();
