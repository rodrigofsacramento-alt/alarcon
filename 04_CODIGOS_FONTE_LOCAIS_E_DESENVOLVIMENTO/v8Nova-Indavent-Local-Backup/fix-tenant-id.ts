import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { error } = await supabase
    .from('leads')
    .update({ tenant_id: '17ee4673-ace6-4b3f-926c-1702486a03f0' })
    .ilike('name', '%Jonathan%');
    
  if (error) {
    console.error("Erro ao atualizar tenant_id:", error);
  } else {
    console.log("Tenant ID corrigido com sucesso!");
  }
}
run();
