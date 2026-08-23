import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  // Check if it's a view by checking postgres metadata
  const { data, error } = await supabase.rpc('get_view_definition', { view_name: 'whatsapp_contacts' });
  if (error) {
    console.log("Not a simple view or rpc not found:", error.message);
  } else {
    console.log("View:", data);
  }
}
run();
