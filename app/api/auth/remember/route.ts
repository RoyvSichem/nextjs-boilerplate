import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { remember } = await req.json().catch(() => ({ remember: false }));
  const res = NextResponse.json({ ok: true });

  if (remember) {
    res.cookies.set('aw_remember', '1', {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dagen
    });
  } else {
    res.cookies.set('aw_remember', '0', {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0,
    });
  }
  return res;
}
