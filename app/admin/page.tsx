'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../../lib/supabase-browser';

export default function AdminPage(){
  const sb = supabaseBrowser();
  const [ok,setOk]=useState<boolean|null>(null);
  const [catTitle,setCatTitle]=useState('Bodyscan');
  const [catSlug,setCatSlug]=useState('bodyscan');
  const [catDesc,setCatDesc]=useState('Ontspan en onderzoek je lichaam');

  const [mTitle,setMTitle]=useState('Bodyscan 10 minuten');
  const [mSlug,setMSlug]=useState('bodyscan-10m');
  const [mSub,setMSub]=useState('Korte sessie om te landen');
  const [mDesc,setMDesc]=useState('Waarom bodyscan belangrijk is, je traint aandacht, je kalmeert het zenuwstelsel, je herstelt focus');
  const [mDur,setMDur]=useState(600);
  const [isFree,setIsFree]=useState(true);
  const [audio,setAudio]=useState<File|null>(null);
  const [cover,setCover]=useState<File|null>(null);
  const [log,setLog]=useState<string>('');

  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await sb.auth.getUser();
      if(!user){ setOk(false); return; }
      const { data: p } = await sb.from('profiles').select('role').eq('id', user.id).single();
      setOk(p?.role==='admin');
    })();
  },[]);

  if(ok===false) return <main style={{maxWidth:640, margin:'40px auto', padding:'0 16px'}}><p>Geen toegang</p></main>;
  if(ok===null) return <main style={{maxWidth:640, margin:'40px auto', padding:'0 16px'}}><p>Laden…</p></main>;

  const run = async (e:React.FormEvent)=>{
    e.preventDefault();
    setLog('Start');
    // categorie
    let catId:number|undefined;
    const { data: cat } = await sb.from('categories').select('id').eq('slug', catSlug).maybeSingle();
    if(cat){ catId = cat.id; setLog(l=>l+', categorie bestaat'); }
    else{
      const { data: ins, error } = await sb.from('categories').insert({ slug:catSlug, title:catTitle, description:catDesc }).select('id').single();
      if(error) return setLog('Fout categorie: '+error.message);
      catId = ins.id; setLog(l=>l+', categorie gemaakt');
    }
    // uploads
    let audioUrl = '', coverUrl = '';
    if(audio){
      const path = `${mSlug}/${Date.now()}-${audio.name}`;
      const { error } = await sb.storage.from('audio').upload(path, audio);
      if(error) return setLog('Fout audio upload: '+error.message);
      const { data } = sb.storage.from('audio').getPublicUrl(path);
      audioUrl = data.publicUrl; setLog(l=>l+', audio geüpload');
    }
    if(cover){
      const path = `${mSlug}/${Date.now()}-${cover.name}`;
      const { error } = await sb.storage.from('covers').upload(path, cover);
      if(error) return setLog('Fout cover upload: '+error.message);
      const { data } = sb.storage.from('covers').getPublicUrl(path);
      coverUrl = data.publicUrl; setLog(l=>l+', cover geüpload');
    }
    // meditatie
    const { error: merr } = await sb.from('meditations').insert({
      category_id: catId, slug: mSlug, title: mTitle, subtitle: mSub,
      description: mDesc, duration_seconds: mDur, audio_url: audioUrl, cover_url: coverUrl, is_free: isFree
    });
    if(merr) return setLog('Fout meditatie: '+merr.message);
    setLog(l=>l+', meditatie aangemaakt, klaar');
  };

  return (
    <main style={{maxWidth:640, margin:'40px auto', padding:'0 16px'}}>
      <h1>Admin, content toevoegen</h1>
      <form onSubmit={run}>
        <h2>Categorie</h2>
        <input value={catTitle} onChange={e=>setCatTitle(e.target.value)} placeholder="Titel" style={s.inp}/>
        <input value={catSlug} onChange={e=>setCatSlug(e.target.value)} placeholder="slug" style={s.inp}/>
        <textarea value={catDesc} onChange={e=>setCatDesc(e.target.value)} placeholder="Beschrijving" style={s.inp}/>
        <h2>Meditatie</h2>
        <input value={mTitle} onChange={e=>setMTitle(e.target.value)} placeholder="Titel" style={s.inp}/>
        <input value={mSlug} onChange={e=>setMSlug(e.target.value)} placeholder="slug" style={s.inp}/>
        <input value={mSub} onChange={e=>setMSub(e.target.value)} placeholder="Subtitel" style={s.inp}/>
        <textarea value={mDesc} onChange={e=>setMDesc(e.target.value)} placeholder="Beschrijving" style={s.inp}/>
        <input type="number" value={mDur} onChange={e=>setMDur(Number(e.target.value))} placeholder="Duur in seconden" style={s.inp}/>
        <label style={{display:'block', margin:'8px 0'}}>
          <input type="checkbox" checked={isFree} onChange={e=>setIsFree(e.target.checked)} /> Gratis
        </label>
        <div style={{display:'grid', gap:8}}>
          <input type="file" accept="audio/*" onChange={e=>setAudio(e.target.files?.[0]||null)} />
          <input type="file" accept="image/*" onChange={e=>setCover(e.target.files?.[0]||null)} />
        </div>
        <button className="btn" style={{marginTop:12}}>Opslaan</button>
      </form>
      <p>{log}</p>
      <style jsx>{`.btn{background:#1E4E3A,color:#fff,border:0,border-radius:999px,padding:12px 18px,font-weight:700}`}</style>
    </main>
  );
}
const s = { inp:{width:'100%',padding:12,borderRadius:12,border:'1px solid #ddd',margin:'8px 0'} };
