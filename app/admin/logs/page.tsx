import { supabaseServer } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function AdminLogs(){
  const sb = await supabaseServer();
  const { data:{ user } } = await sb.auth.getUser();
  if(!user) return <main className="container"><p>Geen toegang</p></main>;
  const { data: me } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if(me?.role !== 'admin') return <main className="container"><p>Geen toegang</p></main>;

  const { data: rows } = await sb
    .from('app_events')
    .select('id, created_at, user_id, type, details')
    .order('created_at', { ascending:false })
    .limit(100);

  return (
    <main className="container" style={{maxWidth:900, margin:'24px auto', display:'grid', gap:12}}>
      <h1>Logs</h1>
      {rows?.map(r=>(
        <div key={r.id} className="card" style={{display:'grid', gap:6}}>
          <div style={{display:'flex', justifyContent:'space-between', gap:12}}>
            <strong>{r.type}</strong>
            <span style={{color:'var(--muted)'}}>{new Date(r.created_at).toLocaleString('nl-NL')}</span>
          </div>
          <div style={{color:'var(--muted)'}}>user, {r.user_id ?? 'anon'}</div>
          <pre style={{margin:0, whiteSpace:'pre-wrap'}}>{JSON.stringify(r.details, null, 2)}</pre>
        </div>
      ))}
    </main>
  );
}
