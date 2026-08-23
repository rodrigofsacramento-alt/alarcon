import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Searching for message with content containing 'teste'...");
  const { data, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          id, phone, sender_name, content, timestamp, type, created_at, remote_jid
        `)
        .ilike('content', '%teste%')
        .order('created_at', { ascending: false })
        .limit(5);
        
  if (error) console.error("Error:", error);
  else {
     console.log(`Found ${data.length} messages.`);
     if (data.length > 0) {
        console.log("Messages:");
        data.forEach(d => console.log(d));
     }
  }
}
check().catch(console.error);
