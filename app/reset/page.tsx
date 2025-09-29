'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const sb = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPage(){
  const [email,setEmail] = useState('');
  const [sent,setSent] = useState(false);
  const [err,setErr] = useState<string|null>(null);

  async function onSubmit(e:React.FormEvent){
    e.preventDefault();
    setErr(null);
    const origin = window.location.origin;
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/update-password`
    });
    if(error) setErr(error.message); else setSent(true);
  }

  return (
    <main className="container" style={{maxWidth:520, padding:'24px 0'}}>
      <h1>Wachtwoord resetten</h1>
      {sent ? (
        <p>Check je mail en volg de link om een nieuw wachtwoord te zetten</p>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{display:'grid', gap:12}}>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="jij@voorbeeld.nl"
                 style={{padding:12, borderRadius:12, border:'1px solid #e5e7eb'}}/>
          <button className="btn">Verstuur reset link</button>
          {err && <p style={{color:'#b91c1c'}}>{err}</p>}
        </form>
      )}
    </main>
  );
}
