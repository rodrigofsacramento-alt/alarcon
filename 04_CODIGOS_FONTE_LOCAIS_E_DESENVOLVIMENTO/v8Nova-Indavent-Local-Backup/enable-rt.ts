import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: `
    alter publication supabase_realtime add table whatsapp_contacts;
    alter publication supabase_realtime add table conversations;
    alter publication supabase_realtime add table whatsapp_messages;
  ` });
  
  // se o rpc falhar por nao existir, vamos apenas imprimir o erro
  console.log("Realtime enable result:", data, error);
}
run();
