import { supabaseServer } from '../../../../lib/supabase'; // 3 niveaus omhoog

export async function POST(req: Request){
  const { meditation_id, seconds, completed } = await req.json();
  const sb = supabaseServer();
  const { data:{ user } } = await sb.auth.getUser();
  if(!user) return new Response('Unauthorized',{status:401});
  await sb.from('sessions').insert({
    user_id: user.id,
    meditation_id,
    seconds_listened: seconds,
    completed,
    ended_at: new Date().toISOString()
  });
  return new Response('ok');
}
