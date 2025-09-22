import { supabaseServer } from '../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

type RowCount = number | null;

function Status({ ok, label, extra }: { ok: boolean, label: string, extra?: string }) {
  return (
    <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
      <div>
        <strong>{label}</strong>
        {extra && <div style={{color:'var(--muted)'}}>{extra}</div>}
      </div>
      <div aria-label={ok ? 'ok' : 'fout'} style={{
        width:12, height:12, borderRadius:999, background: ok ? '#16a34a' : '#ef4444'
      }}/>
    </div>
  );
}

export default async function AdminDiagnostics() {
  const sb = await supabaseServer();

  // user en rol
  const { data: { user } } = await sb.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: me } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
    isAdmin = me?.role === 'admin';
  }

  // env vars server side
  const envOk =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // eenvoudige counts, ontbreken is niet erg
  const cats = await sb.from('categories').select('*', { count: 'exact', head: true });
  const meds = await sb.from('meditations').select('*', { count: 'exact', head: true });
  const favs = user
    ? await sb.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    : { count: null as RowCount };

  // storage buckets lijstje, 1 item is genoeg
  const audioList = await sb.storage.from('audio').list('', { limit: 1 });
  const coversList = await sb.storage.from('covers').list('', { limit: 1 });

  return (
    <main className="container" style={{maxWidth:800, margin:'24px auto', display:'grid', gap:16}}>
      <h1>Diagnostics</h1>
      <p className="lead">Gebruik dit om snel te zien of alles werkt, maak daarna een screenshot voor mij</p>

      <Status ok={!!user} label="Ingelogd" extra={user ? user.email ?? '' : 'niet ingelogd'} />
      <Status ok={isAdmin} label="Admin rol" extra={isAdmin ? 'ok' : 'geen admin'} />
      <Status ok={envOk} label="Env vars" extra={envOk ? 'Supabase URL en anon key aanwezig' : 'ontbreekt'} />
      <Status ok={(cats.count ?? 0) >= 0} label="Categories tabel" extra={`rows, ${cats.count ?? 0}`} />
      <Status ok={(meds.count ?? 0) >= 0} label="Meditations tabel" extra={`rows, ${meds.count ?? 0}`} />
      <Status ok={(favs.count ?? 0) >= 0} label="Favorites voor user" extra={user ? `rows, ${favs.count ?? 0}` : 'niet ingelogd'} />
      <Status ok={!audioList.error} label="Storage, audio bucket" extra={audioList.error ? audioList.error.message : `ok, ${audioList.data?.length ?? 0} items zichtbaar`} />
      <Status ok={!coversList.error} label="Storage, covers bucket" extra={coversList.error ? coversList.error.message : `ok, ${coversList.data?.length ?? 0} items zichtbaar`} />

      <div className="card">
        <h2>Volgende stap</h2>
        <ol>
          <li>Maak een screenshot van dit scherm, inclusief de URL balk, en stuur het naar mij</li>
          <li>Als iets rood is, noteer de regel en de melding die je ziet</li>
        </ol>
      </div>
    </main>
  );
}
