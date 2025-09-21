export const metadata = {
  title: 'Awaren',
  description: 'Meditaties, quotes en programma’s',
  openGraph: { title: 'Awaren', description: 'Meditaties en dagelijkse quotes' }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body style={{fontFamily:'system-ui', background:'#fff', color:'#1a1a1a'}}>
        <nav style={{maxWidth:980, margin:'16px auto', padding:'0 16px', display:'flex', gap:16}}>
          <a href="/">Home</a>
          <a href="/subscribe">Lid worden</a>
          <a href="/profile">Profiel</a>
          <a href="/admin">Admin</a>
          <a href="/logout" style={{marginLeft:'auto'}}>Uitloggen</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
