import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Fonte única de dados: Supabase PROD (ptochsyoyatsydfysacc). Nunca apontar para o DEV aqui.
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ptochsyoyatsydfysacc.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0b2Noc3lveWF0c3lkZnlzYWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDM0MzUsImV4cCI6MjA4NDQxOTQzNX0.7VKER8NpJz5F9l0TOd6AWTg5U8f2IyXfcrIXCE0KwkQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
