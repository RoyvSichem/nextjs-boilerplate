import { supabaseServer } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Category(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sb = await supabaseServer();

  const { data: cat, error: catErr } = await sb
    .from('categories')
    .select()
    .eq('slug', slug)
    .single();

  if (catErr || !cat) {
    return <main className="container"><p>Niet gevonden</p></main>;
  }

  const { data: meds } = await sb
    .from('meditations')
    .select()
    .eq('category_id', cat.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>{cat.title}</h1>
          <p className="lead">{cat.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="grid cards">
          {meds?.map(m => (
            <a key={m.id} href={`/m/${m.slug}`} className="card" style={{display:'flex', gap:14}}>
              {m.cover_url && (
                <img
                  src={m.cover_url}
                  alt=""
                  width={112}
                  height={112}
                  style={{borderRadius:16, objectFit:'cover'}}
                />
              )}
              <div>
                <strong style={{display:'block', fontSize:18}}>{m.title}</strong>
                <div style={{color:'var(--muted)'}}>{m.subtitle}</div>
                {!m.is_free && (
                  <span className="btn ghost" style={{padding:'4px 10px', fontSize:12, marginTop:8}}>
                    Alleen voor leden
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
