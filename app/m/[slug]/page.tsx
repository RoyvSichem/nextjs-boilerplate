import Player from '../../../components/Player';
import { supabaseServer } from '../../../lib/supabase';
import { toggleFavoriteAction } from '../../../lib/actions';

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

  const { data: { user } } = await sb.auth.getUser();
  let favored = false;
  if (user) {
    const { data } = await sb
      .from('favorites')
      .select('meditation_id')
      .match({ user_id: user.id, meditation_id: m.id })
      .maybeSingle();
    favored = !!data;
  }

  const action = toggleFavoriteAction.bind(null, m.id as number, `/m/${slug}`);

  return (
    <>
      <section className="hero">
        <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <div>
            <h1>{m.title}</h1>
            <p className="lead">{m.subtitle}</p>
          </div>
          <form action={action}>
            <button
              aria-label={favored ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
              title={favored ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
              className="btn ghost"
              style={{minWidth:44}}
            >
              {favored ? '❤️' : '♡'}
            </button>
          </form>
        </div>
      </section>

      <section className="section" style={{maxWidth:720, margin:'0 auto'}}>
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
