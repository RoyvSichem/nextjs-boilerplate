'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UpdatePasswordPage() {
  const search = useSearchParams();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [ok, setOk] = useState<string | null>(null);

  // 1) Ruil ?code= om voor een sessie (of verwerk hash tokens van oudere links)
  useEffect(() => {
    async function boot() {
      try {
        const error_description = search.get('error_description');
        if (error_description) {
          setErr(error_description);
          setReady(true);
          return;
        }

        const code = search.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) setErr(error.message);
          setReady(true);
          return;
        }

        // Fallback voor oude/hash-links: #access_token=...&refresh_token=...
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          const p = new URLSearchParams(window.location.hash.slice(1));
          const access_token = p.get('access_token');
          const refresh_token = p.get('refresh_token');
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) setErr(error.message);
          }
          setReady(true);
          return;
        }

        // Geen code/tokens aanwezig: toon formulier maar verwacht dat update faalt
        setReady(true);
      } catch (e: any) {
        setErr(e?.message ?? 'Onbekende fout');
        setReady(true);
      }
    }
    boot();
  }, [search]);

  // 2) Wachtwoord opslaan
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (pw1.length < 8) return setErr('Minimaal 8 tekens.');
    if (pw1 !== pw2) return setErr('Wachtwoorden komen niet overeen.');

    const { error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) {
      setErr(error.message);
    } else {
      setOk('Wachtwoord aangepast. Je kunt nu verder.');
      // Optioneel: stuur door naar login of profiel
      setTimeout(() => router.push('/login'), 1200);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 520, padding: '24px 0' }}>
      <h1>Nieuw wachtwoord</h1>

      {!ready ? (
        <p>Bezig met laden…</p>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 12 }}>
          <input
            type="password"
            placeholder="Nieuw wachtwoord"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            required
            style={{ padding: 12, borderRadius: 12, border: '1px solid #e5e7eb' }}
          />
          <input
            type="password"
            placeholder="Herhaal wachtwoord"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
            style={{ padding: 12, borderRadius: 12, border: '1px solid #e5e7eb' }}
          />

          <button className="btn">Opslaan</button>

          {err && <p style={{ color: '#b91c1c' }}>{err}</p>}
          {ok && <p style={{ color: 'var(--brand)' }}>{ok}</p>}
        </form>
      )}
    </main>
  );
}
