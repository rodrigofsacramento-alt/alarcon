import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const phone = '5511915306257';
  console.log("Apagando registros do telefone:", phone);

  // 1. Encontrar o whatsapp_contact
  const { data: contacts } = await supabase.from('whatsapp_contacts').select('id, profile_id').eq('phone_number', phone);
  
  if (contacts && contacts.length > 0) {
    for (const contact of contacts) {
      // 2. Apagar mensagens desse profile_id
      await supabase.from('whatsapp_messages').delete().or(`sender_id.eq.${contact.profile_id},recipient_id.eq.${contact.profile_id}`);
      
      // 3. Apagar conversas ligadas a esse contact
      await supabase.from('conversations').delete().eq('contact_id', contact.id);
      
      // 4. Apagar o próprio contato
      await supabase.from('whatsapp_contacts').delete().eq('id', contact.id);
      
      console.log("Contato do Whatsapp e mensagens deletados.");
    }
  }

  // 5. Apagar leads_timeline e leads
  const { data: leads } = await supabase.from('leads').select('id').eq('phone', phone);
  
  if (leads && leads.length > 0) {
    for (const lead of leads) {
      // Apagar timeline
      await supabase.from('leads_timeline').delete().eq('lead_id', lead.id);
      // Apagar lead
      await supabase.from('leads').delete().eq('id', lead.id);
      console.log("Lead e timeline deletados.");
    }
  }
  
  console.log("Limpeza concluída com sucesso!");
}
run();
