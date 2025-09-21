import { supabaseServer } from '../../lib/supabase-server';

export default async function Profile(){
  const sb = supabaseServer();
  const { data:{ user } } = await sb.auth.getUser();
  if(!user) return <main style={{maxWidth:560, margin:'40px auto', padding:'0 16px'}}><p>Log eerst in</p></main>;
  const { data: p } = await sb.from('profiles').select('full_name, role').eq('id', user.id).single();
  const { data: s } = await sb.from('user_streaks').select().eq('user_id', user.id).maybeSingle();
  const { data: sub } = await sb.from('subscriptions').select('status,current_period_end').eq('user_id', user.id).maybeSingle();

  return (
    <main style={{maxWidth:560, margin:'24px auto', padding:'0 16px'}}>
      <h1>Profiel</h1>
      <p>Email, {user.email}</p>
      <p>Naam, {p?.full_name || 'onbekend'}</p>
      <p>Rol, {p?.role}</p>
      <p>Streak, {s?.current_streak || 0} dagen, beste, {s?.best_streak || 0}</p>
      <p>Abonnement, {sub?.status || 'geen'}</p>
    </main>
  );
}
