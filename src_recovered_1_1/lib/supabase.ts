import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ptochsyoyatsydfysacc.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '[REDACTED: SECRET_208]';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
