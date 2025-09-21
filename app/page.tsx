'use client';
import { useEffect } from 'react';

export default function CodeBridge(){
  useEffect(()=>{
    const p = new URLSearchParams(location.search);
    const code = p.get('code');
    if(code) location.href = `/auth/callback?code=${code}`;
  },[]);
  return null;
}

import { supabaseServer } from '../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Home(){
  const sb = await supabaseServer();
  const { data: cats } = await sb.from('categories').select().order('title');

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Rust in je hoofd, focus in je dag</h1>
          <p>Luister meditaties, leer in je eigen tempo, bouw een streak op en word lid</p>
          <div style={{marginTop:14, display:'flex', gap:10}}>
            <a className="btn" href="/subscribe">Start nu</a>
            <a className="btn ghost" href="/c/bodyscan">Probeer gratis</a>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Categories</h2>
        <p className="lead">Kies een thema dat bij je past</p>
        <div className="grid cards" style={{marginTop:12}}>
          {cats?.map(c => (
            <a key={c.id} href={`/c/${c.slug}`} className="card">
              <strong style={{display:'block', fontSize:18, marginBottom:6}}>{c.title}</strong>
              <span style={{color:'var(--muted)'}}>{c.description}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
