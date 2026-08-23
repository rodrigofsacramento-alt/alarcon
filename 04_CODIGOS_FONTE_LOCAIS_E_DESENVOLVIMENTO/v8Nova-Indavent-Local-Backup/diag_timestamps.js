import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  console.log("Fetching messages since", twoHoursAgo);
  const { data, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          phone, 
          sender_name, 
          content, 
          timestamp, 
          type,
          created_at
        `)
        .gte('timestamp', twoHoursAgo)
        .order('timestamp', { ascending: false });
        
  if (error) console.error("Error:", error);
  else {
     console.log(`Found ${data.length} messages.`);
     if (data.length > 0) {
        console.log("Sample 1:", data[0]);
     }
  }
}
check().catch(console.error);
