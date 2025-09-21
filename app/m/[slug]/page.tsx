import Player from '../../../components/Player';
import { supabaseServer } from '../../../lib/supabase';

export default async function Meditation(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sb = await supabaseServer();

  const { data: m, error } = await sb
    .from('meditations')
    .select()
    .eq('slug', slug)
    .single();

  if (error || !m) return <main><p>Niet gevonden</p></main>;

  return (
    <main style={{maxWidth:560, margin:'24px auto', padding:'0 16px', textAlign:'center'}}>
      {m.cover_url && <img src={m.cover_url} alt="" style={{width:'100%', borderRadius:24, marginBottom:16}}/>}
      <h1>{m.title}</h1>
      <p style={{color:'#6b6b6b'}}>{m.subtitle}</p>
      <Player src={m.audio_url} duration={m.duration_seconds} meditationId={m.id} />
      <article style={{textAlign:'left', marginTop:16}}>{m.description}</article>
    </main>
  );
}
