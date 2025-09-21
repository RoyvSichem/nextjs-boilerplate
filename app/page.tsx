import { supabaseServer } from '../lib/supabase';

export default async function Home() {
  const sb = supabaseServer();
  const { data: cats } = await sb.from('categories').select().order('sort_order');
  const today = new Date().toISOString().slice(0,10);
  const { data: quote } = await sb.from('daily_quotes').select().eq('date_for', today).maybeSingle();

  return (
    <main style={{maxWidth:980, margin:'24px auto', padding:'0 16px'}}>
      <h1>Awaren</h1>
      {quote && <p><em>“{quote.quote}”</em> {quote.author ? `— ${quote.author}` : ''}</p>}
      <h2>Categorieën</h2>
      <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))'}}>
        {cats?.map(c => (
          <a key={c.id} href={`/c/${c.slug}`} style={{display:'block', background:'#f6f7f6', borderRadius:16, padding:16, textDecoration:'none'}}>
            <strong>{c.title}</strong>
            <div style={{color:'#6b6b6b'}}>{c.description}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
