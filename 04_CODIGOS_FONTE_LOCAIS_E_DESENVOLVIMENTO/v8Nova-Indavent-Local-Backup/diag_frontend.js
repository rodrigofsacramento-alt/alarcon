import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  console.log("Using twoHoursAgo =", twoHoursAgo);

  const { data, error } = await supabase
        .from('whatsapp_messages')
        .select(`
          phone, 
          sender_name, 
          content, 
          timestamp, 
          type,
          lead_id,
          leads (
            id,
            name,
            "Nome",
            stage,
            "Estágio",
            budget,
            "Orçamento"
          )
        `)
        .gte('timestamp', twoHoursAgo)
        .order('timestamp', { ascending: false });

  if (error) console.error("Error:", error);
  else {
     console.log(`Found ${data.length} messages from the exact frontend query.`);
     const testeMsg = data.find(m => m.content && m.content.toLowerCase() === 'teste');
     if (testeMsg) {
         console.log("YES! The 'teste' message was returned by the query:", testeMsg);
     } else {
         console.log("NO! The 'teste' message was NOT returned by the query.");
     }
  }
}
check().catch(console.error);
