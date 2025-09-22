'use server';

import { supabaseServer } from './supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logEvent } from './log';

/** Dagelijkse checkin opslaan en doorsturen naar een suggestie */
export async function createCheckinAction(formData: FormData) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?next=/checkin');

  // input normaliseren
  let mood = Number(formData.get('mood') ?? 3);
  if (Number.isNaN(mood)) mood = 3;
  mood = Math.min(5, Math.max(1, mood));
  const note = String(formData.get('note') ?? '').slice(0, 2000);

  // veilige insert, dubbele dag negeren
  const { error } = await sb.from('checkins').insert({ user_id: user.id, mood, note });
  if (error && error.code !== '23505' && !error.message?.toLowerCase().includes('duplicate')) {
    // log en ga door met suggestie
    await logEvent('checkin.error', { code: error.code, message: error.message });
  } else {
    await logEvent('checkin.created', { mood, hasNote: !!note });
  }

  // eenvoudige mapping, pas slugs aan naar wat jij hebt
  const preferLow = ['ademruimte-3-minuten', 'bodyscan-10-minuten'];
  const preferHigh = ['open-bewustzijn-5-minuten', 'bodyscan-10-minuten'];
  const preferNeutral = ['bodyscan-10-minuten'];
  const wanted = mood <= 2 ? preferLow : mood >= 4 ? preferHigh : preferNeutral;

  // probeer gewenste meditatie
  let dest: string | null = null;
  for (const slug of wanted) {
    const { data } = await sb.from('meditations').select('slug').eq('slug', slug).maybeSingle();
    if (data?.slug) { dest = `/m/${data.slug}`; break; }
  }

  // anders pak een gratis meditatie
  if (!dest) {
    const { data } = await sb
      .from('meditations')
      .select('slug')
      .eq('is_free', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.slug) dest = `/m/${data.slug}`;
  }

  // ultieme fallback
  if (!dest) dest = '/c/bodyscan';

  redirect(dest);
}

/** Favorite togglen en de pagina verversen */
export async function toggleFavoriteAction(meditationId: number, pathToRevalidate: string) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  const key = { user_id: user.id, meditation_id: Number(meditationId) };

  const { data: existing } = await sb
    .from('favorites')
    .select('meditation_id')
    .match(key)
    .maybeSingle();

  if (existing) {
    const { error } = await sb.from('favorites').delete().match(key);
    if (!error) await logEvent('favorite.removed', { meditationId });
  } else {
    const { error } = await sb.from('favorites').insert(key);
    if (!error) await logEvent('favorite.added', { meditationId });
  }

  revalidatePath(pathToRevalidate);
}
