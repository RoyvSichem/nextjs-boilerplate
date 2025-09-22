// app/profile/page.tsx
import { supabaseServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?next=/profile');

  // streak
  const { data: streakRow, error: streakErr } = await sb
    .rpc('get_streak', { p_user_id: user.id })
    .single();

  const currentStreak = streakRow?.current_streak ?? 0;
  const bestStreak = streakRow?.best_streak ?? 0;

  // totaal checkins & laatste
  const { data: totals } = await sb
    .from('checkins')
    .select('created_at', { count: 'exact', head: false })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const totalCheckins = (totals as any[])?.length ? (totals as any[]).length : (totals as any)?.length ?? 0;
  const lastCheckin = (totals as any[])?.[0]?.created_at ?? null;

  // favorieten ids
  const { data: favIds } = await sb
    .from('favorites')
    .select('meditation_id')
    .eq('user_id', user.id);

  let favorites: { id:number; slug:string; title:string; cover_url:string|null; duration:number|null }[] = [];
  if (favIds?.length) {
    const ids = favIds.map(f => f.meditation_id);
    const { data: meds } = await sb
      .from('meditations')
      .select('id, slug, title, cover_url, duration')
      .in('id', ids);
    favorites = meds ?? [];
  }

  return (
    <div className="container section">
      <h1>Jouw profiel</h1>
      <p className="lead">Welkom terug, {user.email?.split('@')[0] ?? 'vriend' }.</p>

      <div className="grid cards" style={{marginTop:12}}>
        <section className="card">
          <h3>Streak</h3>
          <p style={{margin:'8px 0'}}>Huidig: <b>{currentStreak} dag{currentStreak===1?'':'en'}</b><br/>Beste ooit: <b>{bestStreak}</b></p>
          <div style={{height:10, borderRadius:999, background:'#eef2f7', overflow:'hidden'}}>
            <div style={{width:`${Math.min(100, (currentStreak/30)*100)}%`, height:'100%', background:'var(--brand)'}} />
          </div>
          <p style={{color:'var(--muted)', fontSize:13, marginTop:8}}>Tip: check dagelijks in om je streak te verlengen.</p>
          <Link href="/checkin" className="btn" style={{marginTop:8, display:'inline-block'}}>Check nu in</Link>
        </section>

        <section className="card">
          <h3>Statistieken</h3>
          <p style={{margin:'8px 0'}}>Totaal checkins: <b>{totalCheckins}</b></p>
          <p style={{margin:'8px 0'}}>Laatste checkin: <b>{lastCheckin ? new Date(lastCheckin).toLocaleDateString() : '—'}</b></p>
          <Link href="/m/bodyscan-10-minuten" className="btn ghost">Start een sessie</Link>
        </section>
      </div>

      <section className="section" style={{marginTop:16}}>
        <h2>Jouw favorieten</h2>
        {favorites.length === 0 ? (
          <p style={{color:'var(--muted)'}}>Nog geen favorieten. Open een meditatie en klik op het hartje.</p>
        ) : (
          <div className="grid cards" style={{marginTop:8}}>
            {favorites.map(f => (
              <article key={f.id} className="card" style={{display:'flex', gap:12, alignItems:'center'}}>
                {f.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.cover_url} alt="" width={64} height={64} style={{borderRadius:12, objectFit:'cover'}} />
                ) : <div style={{width:64, height:64, borderRadius:12, background:'#eef2f7'}}/>}
                <div style={{flex:1}}>
                  <Link href={`/m/${f.slug}`}><b>{f.title}</b></Link>
                  <div style={{color:'var(--muted)', fontSize:13}}>{f.duration ? `${Math.round(f.duration/60)} min` : ''}</div>
                </div>
                <Link className="btn ghost" href={`/m/${f.slug}`}>Luister</Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
