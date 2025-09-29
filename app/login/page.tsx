'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [id, setId] = useState('');             // e-mail of gebruikersnaam
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let email = id.trim();

      // Als geen '@', dan behandelen als username -> resolve naar e-mail
      if (!email.includes('@')) {
        const { data, error: rErr } = await supabase.rpc('resolve_username', { p_username: email });
        if (rErr) throw rErr;
        if (!data) {
          setError('Onbekende gebruikersnaam');
          setLoading(false);
          return;
        }
        email = String(data);
      }

      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) {
        setError(signErr.message);
        setLoading(false);
        return;
      }

      // Zet onze remember-cookie server-side (bepaalt cookie lifetime in SSR)
      await fetch('/api/auth/remember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remember }),
      });

      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') ?? '/';
      window.location.assign(next);
    } catch (err: any) {
      setError(err?.message ?? 'Er ging iets mis');
      setLoading(false);
    }
  }

  return (
    <main className="container section" style={{ maxWidth: 420 }}>
      <h1>Inloggen</h1>
      <p className="lead">Log in met je e-mail of gebruikersnaam en wachtwoord.</p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <input
          type="text" required value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e-mail of gebruikersnaam"
          style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}
        />
        <input
          type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="wachtwoord"
          style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}
          autoComplete="current-password"
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Wachtwoord onthouden (30 dagen)
        </label>

        {error && <div className="card" style={{ color: '#b91c1c', background:'#fff1f2' }}>{error}</div>}

        <button className="btn" disabled={loading}>
          {loading ? 'Bezig…' : 'Inloggen'}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        <a href="/reset" className="muted">Wachtwoord vergeten?</a>
      </p>
    </main>
  );
}
