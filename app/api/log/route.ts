// app/api/log/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request){
  try {
    const { type, details } = await req.json();
    if (!type || typeof type !== 'string')
      return NextResponse.json({ ok:false, error:'type vereist' }, { status:400 });

    const sb = await supabaseServer();
    const { data:{ user } } = await sb.auth.getUser();
    const { error } = await sb.from('app_events').insert({
      user_id: user?.id ?? null,
      type,
      details: details ?? {}
    });

    if (error) return NextResponse.json({ ok:false, error: error.message }, { status:403 });

    return new NextResponse(null, { status:204 });
  } catch {
    return NextResponse.json({ ok:false, error:'invalid json' }, { status:400 });
  }
}
