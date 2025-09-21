import Player from '../../../components/Player';
import { supabaseServer } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

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

  if (error || !m) {
    return <main className="container"><p>Niet gevonden</p></main>;
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>{m.title}</h1>
          <p className="lead">{m.subtitle}</p>
        </div>
      </section>

      <section className="section" style={{maxWidth:720, margin:'0 auto', padding:'0 4px'}}>
        {m.cover_url && (
          <img
            src={m.cover_url}
            alt=""
            style={{width:'100%', borderRadius:'var(--radius)', boxShadow:'var(--shadow)', marginBottom:14}}
          />
        )}
        <Player src={m.audio_url} duration={m.duration_seconds} meditationId={m.id} />
        <article style={{marginTop:16, color:'var(--text)'}} dangerouslySetInnerHTML={{__html: m.description}} />
      </section>
    </>
  );
}
