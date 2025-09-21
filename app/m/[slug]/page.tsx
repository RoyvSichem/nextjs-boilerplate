import { supabaseServer } from '@/lib/supabase';
import Player from '@/components/Player';

async function logComplete(meditation_id:number, seconds:number){
  'use server';
  const sb = supabaseServer();
  const { data:{ user } } = await sb.auth.getUser();
  if(!user) return;
  await sb.from('sessions').insert({
    user_id: user.id,
    meditation_id,
    seconds_listened: seconds,
    completed: true,
    ended_at: new Date().toISOString()
  });
}

export default async function Meditation({ params }:{params:{slug:string}}){
  const sb = supabaseServer();
  const { data: m } = await sb.from('meditations').select().eq('slug', params.slug).single();
  if(!m) return <main><p>Niet gevonden</p></main>;
  return (
    <main style={{maxWidth:560, margin:'24px auto', padding:'0 16px', textAlign:'center'}}>
      {m.cover_url && <img src={m.cover_url} alt="" style={{width:'100%', borderRadius:24, marginBottom:16}}/>}
      <h1>{m.title}</h1>
      <p style={{color:'#6b6b6b'}}>{m.subtitle}</p>
      <Player src={m.audio_url} duration={m.duration_seconds} onComplete={async (s)=>{ 'use client'; await logComplete(m.id, s); }} />
      <article style={{textAlign:'left', marginTop:16}}>{m.description}</article>
    </main>
  );
}
