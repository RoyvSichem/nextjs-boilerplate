// lib/supabase-server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function supabaseServer() {
  // In Next 15 is cookies() async
  const jar = await cookies();

  // optioneel: remember-me cookie die je zelf zet op login
  const remember = jar.get('aw_remember')?.value === '1';

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return jar.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // bij 'remember' laat expiratie staan, anders sessiecookie forceren
          if (!remember) {
            const o = { ...options };
            // geen vaste expires, dan wordt het een session cookie
            delete (o as any).expires;
            jar.set(name, value, o as any);
          } else {
            jar.set(name, value, options as any);
          }
        },
        remove(name: string, options: CookieOptions) {
          jar.set(name, '', { ...(options as any), expires: new Date(0) });
        },
      },
    }
  );
}
