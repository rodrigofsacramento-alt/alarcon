import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const phone = '5511915306257';
  console.log("Fetching messages for phone", phone);
  const { data, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          id, phone, sender_name, content, timestamp, type, created_at, remote_jid
        `)
        .eq('phone', phone)
        .order('created_at', { ascending: false });
        
  if (error) console.error("Error:", error);
  else {
     console.log(`Found ${data.length} messages.`);
     if (data.length > 0) {
        console.log("Sample 1:", data[0]);
     }
  }
}
check().catch(console.error);
