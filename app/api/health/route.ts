import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase-server';

export async function GET() {
  const sb = await supabaseServer();
  const { error } = await sb.from('categories').select('id').limit(1);
  return NextResponse.json({
    ok: !error,
    time: new Date().toISOString()
  });
}
