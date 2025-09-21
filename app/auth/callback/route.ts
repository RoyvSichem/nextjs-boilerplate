import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request){
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const sb = await supabaseServer();
  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL('/login?error=1', req.url));
    }
  }
  return NextResponse.redirect(new URL('/', req.url));
}
