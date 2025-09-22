// app/admin/diagnostics/page.tsx
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type Row = {
  created_at: string;
  type: string;
  details: any;
  user_id: string | null;
};

export default async function Diagnostics() {
  const sb = await supabaseServer();

  // 1) alleen ingelogd
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return (
      <main className="container">
        <h1>Diagnostics</h1>
        <p>Log eerst in.</p>
      </main>
    );
  }

  // 2) alleen admin
  const { data: me } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (me?.role !== 'admin') {
    return (
      <main className="container">
        <h1>Diagnostics</h1>
        <p>Geen toegang</p>
      </main>
    );
  }

  // 3) laatste events
  const { data: rows = [], error } = await sb
    .from('app_events')
    .select('created_at,type,details,user_id')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Diagnostics</h1>
          <p className="lead">
            Laatste 200 events uit <code>app_events</code>.
            {error && (
              <span style={{ color: '#b91c1c', marginLeft: 8 }}>
                (Kon niet lezen: {error.message})
              </span>
            )}
          </p>
        </div>
      </section>

      <main className="container" style={{ paddingTop: 12 }}>
        {rows.length === 0 ? (
          <div className="card">
            <p>Geen events gevonden. Test snel in de console:</p>
            <pre style={{ background:'#f8fafc', padding:12, borderRadius:12, overflow:'auto' }}>
{`fetch('/api/log', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ type:'player.test', details:{ a:1 } })
});`}
            </pre>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #eef0f1' }}>
                  <th align="left" style={{ padding:'10px 8px' }}>Tijd</th>
                  <th align="left" style={{ padding:'10px 8px' }}>Type</th>
                  <th align="left" style={{ padding:'10px 8px' }}>User</th>
                  <th align="left" style={{ padding:'10px 8px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: Row, i: number) => (
                  <tr key={i} style={{ borderTop:'1px solid #eef0f1' }}>
                    <td style={{ padding:'8px' }}>
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding:'8px' }}>
                      <code>{r.type}</code>
                    </td>
                    <td style={{ padding:'8px', fontFamily:'monospace' }}>
                      {r.user_id ?? 'anon'}
                    </td>
                    <td style={{ padding:'8px', fontFamily:'monospace', whiteSpace:'pre-wrap' }}>
                      {safeJson(r.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

// JSON mooi (en veilig) tonen, ook als het geen object is
function safeJson(v: any) {
  try {
    return typeof v === 'string' ? v : JSON.stringify(v);
  } catch {
    return String(v);
  }
}
