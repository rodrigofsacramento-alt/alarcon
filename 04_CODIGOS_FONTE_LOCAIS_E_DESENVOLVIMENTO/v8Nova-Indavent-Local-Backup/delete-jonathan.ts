import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const phoneStr = '5511915306257';
  console.log('Searching for any occurrences of', phoneStr);

  const { data: leads } = await supabase.from('leads').select('id, name, phone').ilike('phone', `%${phoneStr}%`);
  for (const lead of (leads || [])) {
      console.log('Deleting lead', lead.name, lead.phone);
      await supabase.from('lead_timeline').delete().eq('lead_id', lead.id);
      await supabase.from('activities').delete().eq('lead_id', lead.id);
      await supabase.from('leads').delete().eq('id', lead.id);
  }

  const { data: contacts } = await supabase.from('whatsapp_contacts').select('id, name, phone_number').ilike('phone_number', `%${phoneStr}%`);
  for (const contact of (contacts || [])) {
      console.log('Deleting whatsapp_contact', contact.name, contact.phone_number);
      await supabase.from('whatsapp_contacts').delete().eq('id', contact.id);
  }

  const { data: profiles } = await supabase.from('profiles').select('id, full_name, phone').ilike('phone', `%${phoneStr}%`);
  for (const profile of (profiles || [])) {
      console.log('Deleting profile', profile.full_name, profile.phone);
      await supabase.from('profiles').delete().eq('id', profile.id);
  }

  const { data: convs } = await supabase.from('conversations').select('id').or(`phone.ilike.%${phoneStr}%,title.ilike.%${phoneStr}%`);
  for (const c of (convs || [])) {
      console.log('Deleting conversation', c.id);
      await supabase.from('whatsapp_messages').delete().eq('conversation_id', c.id);
      await supabase.from('messages').delete().eq('conversation_id', c.id);
      await supabase.from('conversations').delete().eq('id', c.id);
  }

  console.log('All cleanup completed for', phoneStr);
}

run();
