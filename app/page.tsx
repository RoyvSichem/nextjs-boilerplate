import { supabaseServer } from '../lib/supabase-server';
import CodeBridge from '../components/CodeBridge';

export const dynamic = 'force-dynamic';

export default async function Home(){
  const sb = await supabaseServer();

  const { data: cats } = await sb
    .from('categories')
    .select('id,slug,title,description')
    .order('title');

  const { data: latest } = await sb
    .from('meditations')
    .select('id,slug,title,subtitle,cover_url')
    .eq('is_free', true)
    .order('created_at', { ascending:false })
    .limit(6);

  return (
    <>
      <CodeBridge />
      <section className="hero">
        <div className="container">
          <h1>Welkom terug</h1>
          <p className="lead">Ga verder met oefenen, kies een meditatie of start je check in</p>
          <div style={{marginTop:12, display:'flex', gap:12, flexWrap:'wrap'}}>
            <a className="btn" href="/checkin">Check in</a>
            <a className="btn ghost" href="/c/bodyscan">Snel starten</a>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>Categorieën</h2>
        <div className="grid cards">
          {cats?.length
            ? cats.map(c=>(
                <a key={c.id} href={`/c/${c.slug}`} className="card">
                  <strong>{c.title}</strong>
                  {c.description && <p className="muted" style={{marginTop:6}}>{c.description}</p>}
                </a>
              ))
            : <p className="muted">Nog geen categorieën</p>}
        </div>
      </section>

      {!!latest?.length && (
        <section className="container section">
          <h2>Gratis voor jou</h2>
          <div className="grid cards">
            {latest.map(m=>(
              <a key={m.id} href={`/m/${m.slug}`} className="card" style={{display:'grid', gap:10}}>
                {m.cover_url && <img src={m.cover_url} alt="" style={{borderRadius:12}} />}
                <div>
                  <strong>{m.title}</strong>
                  {m.subtitle && <div className="muted">{m.subtitle}</div>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
