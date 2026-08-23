import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const sql = fs.readFileSync('fix_broker_columns.sql', 'utf8');
  // Em Postgresql via rest client é ruim de rodar DDL, mas o user vai colar no SQL Editor
  // Vou usar REST API do Supabase pra tentar rodar:
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });
  console.log("Status:", res.status);
}
fix();
