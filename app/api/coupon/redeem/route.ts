import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request){
  const sb = await supabaseServer();
  const { data:{ user } } = await sb.auth.getUser();
  if(!user) return NextResponse.redirect(new URL('/login?next=/subscribe', req.url));

  // code uit form body
  const form = await req.formData();
  const code = String(form.get('code') ?? '').trim();
  if(!code) return NextResponse.redirect(new URL('/subscribe?coupon_error=empty', req.url));

  const { data, error } = await sb.rpc('redeem_coupon', { p_user_id: user.id, p_code: code });
  if(error){
    return NextResponse.redirect(new URL('/subscribe?coupon_error=server', req.url));
  }
  const ok = Array.isArray(data) ? data[0]?.ok : (data as any)?.ok;
  const msg = Array.isArray(data) ? data[0]?.message : (data as any)?.message;
  const qs = ok ? `coupon_ok=${encodeURIComponent(msg||'ok')}` : `coupon_error=${encodeURIComponent(msg||'error')}`;
  return NextResponse.redirect(new URL(`/subscribe?${qs}`, req.url));
}
