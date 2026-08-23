import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { error: insertErr } = await supabase.from('leads').insert({
    name: "Teste Lead Antigravidade",
    phone: "11999999992",
    source_details: 'sistema',
    stage: 'Cadastrado'
  });
  
  if (insertErr) {
    console.log("Erro ao inserir Teste:", insertErr);
  } else {
    console.log("Lead Teste criado com sucesso!");
  }
}
run();
