import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  if (host === 'awaren.app') {
    const url = new URL(req.url);
    url.hostname = 'www.awaren.app';
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// alle routes behalve static assets
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
