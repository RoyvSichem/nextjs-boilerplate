import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase-server';

export async function POST(req: Request){
  try{
    const { type, details } = await req.json();
    if(!type || typeof type !== 'string'){
      return NextResponse.json({ ok:false, error:'type vereist' }, { status: 400 });
    }
    const sb = await supabaseServer();
    const { data:{ user } } = await sb.auth.getUser();
    await sb.from('app_events').insert({
      user_id: user?.id ?? null,
      type,
      details: details ?? {}
    });
    return NextResponse.json({ ok:true });
  }catch(e){
    return NextResponse.json({ ok:false, error:'invalid json' }, { status: 400 });
  }
}
