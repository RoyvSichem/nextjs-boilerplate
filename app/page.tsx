// app/page.tsx
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabaseServer } from '../lib/supabase-server';

// Laad CodeBridge alleen in de browser (voorkomt server-side crashes)
const CodeBridge = dynamic(() => import('../components/CodeBridge'), { ssr: false });

export const dynamic = 'force-dynamic';

type Category = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
};

type LiteMeditation = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
};

export default async function Home() {
  let cats: Category[] = [];
  let latest: LiteMeditation[] = [];
  let catsOk = true;
  let latestOk = true;

  try {
    const sb = await supabaseServer();

    // Categorieën
    const { data: cData, error: cErr } = await sb
      .from('categories')
      .select('id, slug, title, description')
      .order('title');

    if (cErr) {
      console.error('categories query error:', cErr.message);
      catsOk = false;
    } else {
      cats = (cData as Category[]) ?? [];
    }

    // Laatste gratis meditaties
    const { data: lData, error: lErr } = await sb
      .from('meditations')
      .select('id, slug, title, subtitle, cover_url')
      .eq('is_free', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (lErr) {
      console.error('meditations query error:', lErr.message);
      latestOk = false;
    } else {
      latest = (lData as LiteMeditation[]) ?? [];
    }
  } catch (e) {
    console.error('home load failed:', e);
    catsOk = false;
    latestOk = false;
  }

  return (
    <>
      <CodeBridge />

      <section className="hero">
        <div className="container">
          <h1>Welkom terug</h1>
          <p className="lead">Ga verder met oefenen, kies een meditatie of start je check in</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="btn" href="/checkin">Check in</Link>
            <Link className="btn ghost" href="/c/bodyscan">Snel starten</Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>Categorieën</h2>

        {!catsOk ? (
          <div className="card">
            <p className="muted">Kon categorieën niet laden. Probeer het later opnieuw.</p>
          </div>
        ) : cats.length ? (
          <div className="grid cards">
            {cats.map((c) => (
              <Link key={c.id} href={`/c/${c.slug}`} className="card">
                <strong>{c.title}</strong>
                {c.description && (
                  <p className="muted" style={{ marginTop: 6 }}>
                    {c.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">Nog geen categorieën</p>
        )}
      </section>

      {latestOk && latest.length > 0 && (
        <section className="container section">
          <h2>Gratis voor jou</h2>
          <div className="grid cards">
            {latest.map((m) => (
              <Link
                key={m.id}
                href={`/m/${m.slug}`}
                className="card"
                style={{ display: 'grid', gap: 10 }}
              >
                {m.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.cover_url} alt="" style={{ borderRadius: 12 }} />
                )}
                <div>
                  <strong>{m.title}</strong>
                  {m.subtitle && <div className="muted">{m.subtitle}</div>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
