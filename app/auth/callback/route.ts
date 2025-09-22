import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request){
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';
  const sb = await supabaseServer();

  if (!code) {
    const u = new URL('/login', req.url);
    u.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(u);
  }

  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('exchange error', error);
    const u = new URL('/login', req.url);
    u.searchParams.set('error', error.message);
    return NextResponse.redirect(u);
  }

  return NextResponse.redirect(new URL(next, req.url));
}
