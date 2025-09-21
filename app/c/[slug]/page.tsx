import { supabaseServer } from '@/lib/supabase';

export default async function Category({ params }:{params:{slug:string}}){
  const sb = supabaseServer();
  const { data: cat } = await sb.from('categories').select().eq('slug', params.slug).single();
  if(!cat) return <main><p>Niet gevonden</p></main>;
  const { data: meds } = await sb.from('meditations').select().eq('category_id', cat.id).order('created_at',{ascending:false});
  return (
    <main style={{maxWidth:980, margin:'24px auto', padding:'0 16px'}}>
      <h1>{cat.title}</h1>
      <p>{cat.description}</p>
      <div style={{display:'grid', gap:12}}>
        {meds?.map(m => (
          <a key={m.id} href={`/m/${m.slug}`} style={{display:'flex', gap:16, textDecoration:'none', background:'#fafafa', borderRadius:12, padding:12}}>
            {m.cover_url && <img src={m.cover_url} alt="" width={96} height={96} style={{borderRadius:12, objectFit:'cover'}} />}
            <div>
              <strong>{m.title}</strong>
              <div style={{color:'#6b6b6b'}}>{m.subtitle}</div>
              {!m.is_free && <span style={{background:'#f2f5f3', color:'#1E4E3A', padding:'2px 8px', borderRadius:999}}>leden</span>}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
