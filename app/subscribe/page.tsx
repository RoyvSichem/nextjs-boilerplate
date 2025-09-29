import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function SubscribePage(){
  const sb = await supabaseServer();
  const { data:{ user } } = await sb.auth.getUser();

  let plan = 'free';
  let sub_expires_at: string | null = null;
  if(user){
    const { data: me } = await sb.from('profiles').select('plan, sub_expires_at').eq('id', user.id).maybeSingle();
    if(me){ plan = me.plan; sub_expires_at = me.sub_expires_at; }
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.awaren.app';

  return (
    <main className="container" style={{maxWidth:640, padding:'24px 0'}}>
      <h1>Lid worden</h1>
      {!user && (
        <p className="lead">Log eerst in of maak een account op de <a href="/register">registreren</a> pagina</p>
      )}

      {user && (
        <>
          <section className="card" style={{display:'grid', gap:12, marginTop:12}}>
            <p><b>Huidig plan</b>, {plan}{sub_expires_at ? `, geldig tot ${new Date(sub_expires_at).toLocaleDateString()}` : ''}</p>

            <form action="/api/coupon/redeem" method="POST" style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
              <input name="code" placeholder="Coupon code"
                     style={{flex:'1 1 220px', padding:12, borderRadius:12, border:'1px solid #e5e7eb'}} />
              <button className="btn" type="submit">Gebruik coupon</button>
            </form>

            <div style={{marginTop:8, color:'var(--muted)'}}>Of kies een betaald abonnement, €4,95 per maand</div>

            <form action="/api/subscribe/checkout" method="POST">
              <button className="btn">Start abonnement</button>
            </form>

            <small style={{color:'var(--muted)'}}>Afrekenen opent in een veilige omgeving, na succes kom je terug naar {site}</small>
          </section>
        </>
      )}
    </main>
  );
}
