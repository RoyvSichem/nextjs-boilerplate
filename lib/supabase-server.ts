import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function supabaseServer() {
  const jar = cookies();
  const remember = jar.get('aw_remember')?.value === '1';

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name)   { return jar.get(name)?.value; },
        set(name, value, options) { jar.set(name, value, { ...options, path: '/' }); },
        remove(name, options)     { jar.delete({ name, ...options }); },
      },
      cookieOptions: {
        // 0 = session cookie (tot browser sluit); 30d als onthouden
        lifetime: remember ? 60 * 60 * 24 * 30 : 0,
        sameSite: 'lax',
      },
    }
  );
}
