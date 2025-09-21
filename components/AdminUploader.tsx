'use client';
import { useState } from 'react';
import { supabaseBrowser } from '../lib/supabase-browser';

export default function AdminUploader(){
  const sb = supabaseBrowser();
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [busy, setBusy] = useState(false);

  async function upload(bucket: 'audio'|'covers', file: File){
    setBusy(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await sb.storage.from(bucket).upload(path, file, { upsert:false });
    if(error){ alert(error.message); setBusy(false); return; }
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    if(bucket==='audio') setAudioUrl(data.publicUrl);
    else setCoverUrl(data.publicUrl);
    setBusy(false);
  }

  return (
    <div className="card" style={{display:'grid', gap:12}}>
      <label style={{display:'grid', gap:6}}>
        <span>Upload audio</span>
        <input type="file" accept="audio/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) upload('audio', f); }} />
        {audioUrl && <input readOnly value={audioUrl} style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}} />}
      </label>

      <label style={{display:'grid', gap:6}}>
        <span>Upload cover</span>
        <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) upload('covers', f); }} />
        {coverUrl && <input readOnly value={coverUrl} style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}} />}
      </label>

      {busy && <span style={{color:'var(--muted)'}}>Bezig met uploaden…</span>}
    </div>
  );
}
