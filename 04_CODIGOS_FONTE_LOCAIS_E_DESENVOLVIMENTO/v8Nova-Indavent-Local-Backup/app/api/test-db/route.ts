import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-static';

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 });
  const { data, error } = await supabase
    .from('activities')
    .select('*, internal_users(name)')
    .limit(1);

  return NextResponse.json({ data, error });
}
