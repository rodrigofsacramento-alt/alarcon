import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ldfcqxeehgaftxsgxkag.supabase.co';
const supabaseKey = 'JWT_SUPABASE_REDIGIDO';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing Indavent Supabase connection...");
  const { data, error } = await supabase.from('leads').select('id').limit(1);
  if (error) {
    console.error("ERROR:", error.message);
  } else {
    console.log("SUCCESS! Got data:", data);
  }
}

test();
