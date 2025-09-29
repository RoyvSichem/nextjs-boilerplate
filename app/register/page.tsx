'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const sb = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage(){
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [msg, setMsg] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    // remember cookie, je server helper leest deze en zet sessie persistent
    document.cookie = `aw_remember=${remember?'1':'0'}; Path=/; Max-Age=${remember?60*60*24*365:0}`;

    const { error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if(error){
      setMsg(error.message);
    }else{
      setMsg('Check je e-mail om je registratie te bevestigen');
    }
    setBusy(false);
  }

  return (
    <main className="container" style={{maxWidth:520, padding:'24px 0'}}>
      <h1>Registreren</h1>
      <p className="lead">Maak je account aan en start met Awaren</p>

      <form onSubmit={onSubmit} className="card" style={{display:'grid', gap:12}}>
        <input
          type="text" placeholder="Gebruikersnaam" required
          value={username} onChange={e=>setUsername(e.target.value)}
          style={{padding:12, borderRadius:12, border:'1px solid #e5e7eb'}}
        />
        <input
          type="email" placeholder="Email" required
          value={email} onChange={e=>setEmail(e.target.value)}
          style={{padding:12, borderRadius:12, border:'1px solid #e5e7eb'}}
        />
        <input
          type="password" placeholder="Wachtwoord" required
          value={password} onChange={e=>setPassword(e.target.value)}
          style={{padding:12, borderRadius:12, border:'1px solid #e5e7eb'}}
        />

        <label style={{display:'flex', alignItems:'center', gap:8}}>
          <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
          Ingelogd blijven
        </label>

        <button disabled={busy} className="btn">{busy ? 'Bezig...' : 'Account aanmaken'}</button>
        {msg && <p style={{color: msg.startsWith('Check')?'var(--brand)':'#b91c1c'}}>{msg}</p>}
      </form>

      <p style={{marginTop:12}}>
        Al een account, <Link href="/login">log hier in</Link>, wachtwoord vergeten, <Link href="/reset">reset hier</Link>
      </p>
    </main>
  );
}
