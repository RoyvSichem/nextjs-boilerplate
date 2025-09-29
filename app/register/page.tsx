'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // onthoud “ingelogd blijven” in cookie voor de server client
    document.cookie = `aw_remember=${remember ? '1' : '0'}; Path=/; Max-Age=${remember ? 60*60*24*365 : 0}`;

    const origin = window.location.origin;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        // BELANGRIJK: zorg dat deze URL in Supabase > Auth > Redirect URLs staat
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      // typische fout als e-mail al bestaat
      if (error.message?.toLowerCase().includes('already registered')) {
        setError('Dit e-mailadres is al geregistreerd. Log in of reset je wachtwoord.');
      } else {
        setError(error.message || 'Registratie mislukt.');
      }
      return;
    }

    // success: velden leeg + succesmelding tonen
    setUsername('');
    setEmail('');
    setPassword('');
    setSent(true);
  }

  return (
    <main className="container section" style={{maxWidth:520}}>
      <h1>Registreren</h1>
      <p className="lead">Maak je account aan en start met Awaren</p>

      {sent ? (
        <div className="card" style={{marginTop:12}}>
          <p>Check je e-mail om je registratie te bevestigen.</p>
          <p className="muted" style={{marginTop:8}}>
            Geen mail? Kijk je spam/ongewenst na of klik later opnieuw op “Account aanmaken”.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{display:'grid', gap:10, marginTop:12}}>
          <input
            placeholder="Naam"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
          <label style={{display:'flex', gap:8, alignItems:'center', marginTop:4}}>
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
            Ingelogd blijven
          </label>

          <button className="btn" disabled={loading}>
            {loading ? 'Bezig…' : 'Account aanmaken'}
          </button>

          {error && <p style={{color:'#b91c1c'}}>{error}</p>}
        </form>
      )}

      <p style={{marginTop:12}}>
        Al een account? <a href="/login">Log hier in</a>, wachtwoord vergeten?
        {' '}<a href="/auth/reset">Reset hier</a>
      </p>
    </main>
  );
}
