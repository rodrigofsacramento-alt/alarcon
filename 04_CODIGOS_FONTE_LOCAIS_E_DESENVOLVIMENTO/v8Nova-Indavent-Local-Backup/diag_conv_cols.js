import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCols() {
  const { data, error } = await supabase.from('conversations').select('*').limit(1);
  if (error) {
     // try selecting just id
     console.log("Error selecting *", error.message);
  } else if (data.length > 0) {
     console.log("Columns:", Object.keys(data[0]));
  } else {
     // insert a dummy and fetch it? No, just try to get column names using a bad query to see if it lists them.
     const { data: d2, error: e2 } = await supabase.from('conversations').select('non_existent_column_123').limit(1);
     console.log("Error details:", e2);
  }
}

checkCols().catch(console.error);
