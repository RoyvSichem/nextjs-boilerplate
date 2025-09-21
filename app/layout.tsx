import './globals.css';
import { supabaseServer } from '../lib/supabase-server';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Awaren', description: 'Meditaties en meer' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: me } =
    user
      ? await sb.from('profiles').select('role').eq('id', user.id).single()
      : { data: null as any };

  async function signOut() {
    'use server';
    const sb2 = await supabaseServer();
    await sb2.auth.signOut();
    redirect('/');
  }

  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <nav className="site">
          <div className="container inner">
            <a className="logo" href="/">
              <span className="logo-badge">A</span>
              <span>awaren</span>
            </a>

            <div className="navlinks">
              <a href="/c/bodyscan">Meditaties</a>
              <a href="/community">Community</a>

              {user ? (
                <>
                  <a href="/profile">Profiel</a>
                  {me?.role === 'admin' && <a href="/admin">Admin</a>}
                  <form action={signOut} style={{margin:0}}>
                    <button className="btn ghost" type="submit">Uitloggen</button>
                  </form>
                </>
              ) : (
                <>
                  <a className="btn ghost" href="/login">Inloggen</a>
                  <a className="btn" href="/subscribe">Lid worden</a>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="container">{children}</main>

        <footer className="container" style={{padding:'40px 0', color:'var(--muted)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, borderTop:'1px solid #eef0f1', paddingTop:16}}>
            <div>© {new Date().getFullYear()} Awaren</div>
            <div style={{display:'flex', gap:16}}>
              <a href="https://awaren.eu">Website</a>
              <a href="/privacy">Privacy</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
