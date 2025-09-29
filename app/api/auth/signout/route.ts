import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST() {
  const sb = await supabaseServer();
  await sb.auth.signOut();

  const res = NextResponse.json({ ok: true });
  res.cookies.delete('aw_remember');
  return res;
}
