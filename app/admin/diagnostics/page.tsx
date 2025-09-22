// app/admin/diagnostics/page.tsx
import { supabaseServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type AppEvent = {
  id: string;
  created_at: string;
  user_id: string | null;
  type: string;
  details: any;
};

export default async function DiagnosticsPage() {
  const sb = await supabaseServer();

  // check user + admin
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?next=/admin/diagnostics');

  const { data: me } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (me?.role !== 'admin') {
    return (
      <main className="container" style={{ paddingTop: 24 }}>
        <p>Geen toegang</p>
      </main>
    );
  }

  // events
  const { data } = await sb
    .from('app_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  // ✅ veilige default zodat .length altijd bestaat
  const rows: AppEvent[] = data ?? [];

  const testSnippet =
    `fetch('/api/log', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ type: 'player.test', details: { a: 1 } })
}).then(r => r.json()).then(console.log)`;

  return (
    <main className="container" style={{ paddingTop: 12 }}>
      <h1>Diagnostics</h1>
      <p className="lead">Laatste events uit <code>app_events</code></p>

      {rows.length === 0 ? (
        <div className="card">
          <p>Geen events gevonden. Test snel in de console:</p>
          <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 12, overflow: 'auto' }}>
            {testSnippet}
          </pre>
        </div>
      ) : (
        <div className="grid" style={{ marginTop: 12 }}>
          {rows.map((ev) => (
            <article key={ev.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <b>{ev.type}</b>
                <span style={{ color: 'var(--muted)' }}>
                  {new Date(ev.created_at).toLocaleString()}
                </span>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                user: {ev.user_id ?? '—'}
              </div>
              <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 12, overflow: 'auto', marginTop: 8 }}>
                {JSON.stringify(ev.details ?? {}, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      )}

      <section className="section" style={{ marginTop: 16 }}>
        <h2>Snel test-script</h2>
        <p>Plak in de browser-console om een test-event te loggen:</p>
        <pre style={{ background: '#f8fafc', padding: 12, borderRadius: 12, overflow: 'auto' }}>
          {testSnippet}
        </pre>
      </section>
    </main>
  );
}
