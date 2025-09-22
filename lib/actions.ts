import 'server-only';
import { supabaseServer } from './supabase-server';

/** checkin opslaan en suggestie bepalen */
export async function createCheckin(formData: FormData){
  const sb = await supabaseServer();
  const mood = Number(formData.get('mood') || 3);
  const note = String(formData.get('note') || '');
  const { data: { user } } = await sb.auth.getUser();
  if(!user) return { ok:false, error:'Unauthorized' };

  const { error } = await sb.from('checkins').insert({ user_id:user.id, mood, note });
  if(error) return { ok:false, error:error.message };

  // simpele suggestie, je kunt dit later slimmer maken
  let suggestion = { href:'/m/bodyscan-10-minuten', title:'Bodyscan 10 minuten' };
  if(mood <= 2) suggestion = { href:'/m/ademruimte-3-minuten', title:'Ademruimte 3 minuten' };
  if(mood >= 4) suggestion = { href:'/m/open-bewustzijn-5-minuten', title:'Open bewustzijn 5 minuten' };
  return { ok:true, suggestion };
}

/** favorite togglen */
export async function toggleFavorite(meditationId: number){
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if(!user) return { ok:false, error:'Unauthorized' };
  const key = { user_id:user.id, meditation_id:meditationId };
  const { data } = await sb.from('favorites').select('meditation_id').match(key).maybeSingle();
  if(data){
    await sb.from('favorites').delete().match(key);
    return { ok:true, favored:false };
  }else{
    await sb.from('favorites').insert(key);
    return { ok:true, favored:true };
  }
}

/** booster dag afronden */
export async function completeBoosterDay(boosterId: number, day: number){
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if(!user) return { ok:false, error:'Unauthorized' };
  const { error } = await sb.from('user_booster_progress')
    .insert({ user_id:user.id, booster_id:boosterId, day_number:day });
  if(error && !error.message.includes('duplicate key')) return { ok:false, error:error.message };
  return { ok:true };
}
