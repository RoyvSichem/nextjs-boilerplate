import 'server-only';
import { supabaseServer } from './supabase-server';

export async function logEvent(type: string, details: any = {}){
  const sb = await supabaseServer();
  const { data:{ user } } = await sb.auth.getUser();
  await sb.from('app_events').insert({ user_id: user?.id ?? null, type, details });
}
