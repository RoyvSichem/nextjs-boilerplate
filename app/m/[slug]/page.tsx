// app/m/[slug]/page.tsx
import Player from '@/components/Player';
import FavButton from '@/components/FavButton';
import { supabaseServer } from '@/lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Meditation({
  params,
}: { params: { slug: string } }) {
  const { slug } = params;
  const sb = await supabaseServer();

  // Meditatie ophalen
  const { data: m, error } = await sb
    .from('meditations')
    .select('id, slug, title, subtitle, description, cover_url, audio_url, duration_seconds')
    .eq('slug', slug)
    .single();

  if (error || !m) {
    return (
      <main className="container section">
        <h1>Niet gevonden</h1>
        <p>Deze meditatie bestaat niet (meer).</p>
        <Link className="btn" href="/">Terug naar home</Link>
      </main>
    );
  }

  // Gebruiker + favoriet-status
  const { data: { user } } = await sb.auth.getUser();
  let isFav = false;
  if (user) {
    const { data: fav } = await sb
      .from('favorites')
      .select('meditation_id')
      .eq('user_id', user.id)
      .eq('meditation_id', m.id)
      .maybeSingle();
    isFav = !!fav;
  }

  return (
    <>
      <section className="hero">
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div>
            <h1>{m.title}</h1>
            {m.subtitle && <p className="lead">{m.subtitle}</p>}
          </div>

          {/* Hartje alleen tonen als iemand ingelogd is (anders login aanbieden) */}
          {user ? (
            <FavButton meditationId={m.id} isFav={isFav} path={`/m/${m.slug}`} />
          ) : (
            <Link className="btn ghost" href={`/login?next=/m/${m.slug}`} aria-label="Log in om te bewaren">
              ♡ Bewaar
            </Link>
          )}
        </div>
      </section>

      <section className="section" style={{ maxWidth: 720, margin: '0 auto' }}>
        {m.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.cover_url}
            alt=""
            style={{ width:'100%', borderRadius:'var(--radius)', boxShadow:'var(--shadow)', marginBottom:14 }}
          />
        )}

        {m.audio_url && (
          <Player
            src={m.audio_url}
            duration={m.duration_seconds ?? 0}
            meditationId={String(m.id)}
          />
        )}

        {m.description && (
          <article
            style={{ marginTop:16, color:'var(--text)' }}
            dangerouslySetInnerHTML={{ __html: m.description }}
          />
        )}
      </section>
    </>
  );
}
