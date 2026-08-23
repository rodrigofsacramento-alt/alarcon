import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulate() {
  const phone = '5511999999999';
  const tenant_id = '17ee4673-ace6-4b3f-926c-1702486a03f0'; // from diag_session.js
  const syntheticEmail = `${phone}@estateia.com`;
  
  console.log("1. Creating user in auth...");
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: syntheticEmail,
      password: 'password123!',
      email_confirm: true,
      user_metadata: { full_name: 'Test' }
  });
  
  if (userError && !userError.message.includes('already')) {
      console.error("User error:", userError);
      return;
  }
  
  let profileId = userData?.user?.id;
  if (!profileId) {
      console.log("User already exists, finding id...");
      // For simulation, just get an existing id or skip if not important, but let's try to get it
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users.find(u => u.email === syntheticEmail);
      if (user) profileId = user.id;
  }
  console.log("Profile ID:", profileId);
  if (!profileId) return;

  console.log("2. Inserting into profiles...");
  const { error: pErr } = await supabase.from('profiles').insert({
      id: profileId,
      tenant_id,
      full_name: 'Test',
      phone
  });
  if (pErr && pErr.code !== '23505') console.error("Profiles error:", pErr);

  console.log("3. Inserting into conversations...");
  const conversationPayload = {
      tenant_id,
      client_id: profileId,
      agent_id: null,
      subject: `WhatsApp - Test`,
      status: 'pending',
      last_message_at: new Date().toISOString(),
  };
  const { error: cErr } = await supabase.from('conversations').insert(conversationPayload);
  if (cErr) {
      console.error("Conversations error:", cErr);
  } else {
      console.log("Conversations insert SUCCESS!");
  }
  
  console.log("4. Inserting into whatsapp_contacts...");
  const { error: wErr } = await supabase.from('whatsapp_contacts').insert({
      tenant_id,
      profile_id: profileId,
      phone_number: phone,
      name: 'Test'
  });
  if (wErr && wErr.code !== '23505') console.error("whatsapp_contacts error:", wErr);
}

simulate().catch(console.error);
