'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const sb = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UpdatePasswordPage(){
  const [pw1,setPw1] = useState('');
  const [pw2,setPw2] = useState('');
  const [msg,setMsg] = useState<string|null>(null);
  const [ready,setReady] = useState(false);

  useEffect(()=>{
    // als je via de mail hier komt zet Supabase de session, daarna mag je updaten
    sb.auth.getSession().then(()=>setReady(true));
  },[]);

  async function onSubmit(e:React.FormEvent){
    e.preventDefault();
    if(pw1.length < 8) return setMsg('Minimaal 8 tekens');
    if(pw1 !== pw2) return setMsg('Wachtwoorden verschillen');
    const { error } = await sb.auth.updateUser({ password: pw1 });
    if(error) setMsg(error.message); else setMsg('Wachtwoord aangepast, je kunt nu inloggen');
  }

  return (
    <main className="container" style={{maxWidth:520, padding:'24px 0'}}>
      <h1>Nieuw wachtwoord</h1>
      {!ready ? <p>Bezig met laden</p> : (
        <form onSubmit={onSubmit} className="card" style={{display:'grid', gap:12}}>
          <input type="password" placeholder="Nieuw wachtwoord" value={pw1} onChange={e=>setPw1(e.target.value)} required
                 style={{padding:12, borderRadius:12, border:'1px solid #e5e7eb'}}/>
          <input type="password" placeholder="Herhaal wachtwoord" value={pw2} onChange={e=>setPw2(e.target.value)} required
                 style={{padding:12, borderRadius:12, border:'1px solid #e5e7eb'}}/>
          <button className="btn">Opslaan</button>
          {msg && <p style={{color: msg.startsWith('Wachtwoord aangepast') ? 'var(--brand)' : '#b91c1c'}}>{msg}</p>}
        </form>
      )}
    </main>
  );
}
