import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xmsulduzvufdzkfktovk.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtc3VsZHV6dnVmZHprZmt0b3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNTU1OTgsImV4cCI6MjEwMDkzMTU5OH0.TkfD8EKunyPKUFamym-OTUQIuBMUtgHnU_s2iixEHl0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
