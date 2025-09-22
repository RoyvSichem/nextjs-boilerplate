'use server';

import { supabaseServer } from './supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/** Dagelijkse checkin opslaan en doorsturen naar een suggestie */
export async function createCheckinAction(formData: FormData) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    redirect('/login?next=/checkin');
  }

  const mood = Number(formData.get('mood') ?? 3);
  const note = String(formData.get('note') ?? '');

  // veilige insert, dubbele dag negeren
  const { error } = await sb.from('checkins').insert({ user_id: user.id, mood, note });
  if (error && !error.message.includes('duplicate key')) {
    // laat het niet crashen, maar ga door met een suggestie
    console.error('checkin insert error', error.message);
  }

  // eenvoudige mapping, pas de slugs aan naar wat jij in je database hebt
  const preferLow = ['ademruimte-3-minuten', 'bodyscan-10-minuten'];
  const preferHigh = ['open-bewustzijn-5-minuten', 'bodyscan-10-minuten'];
  const preferNeutral = ['bodyscan-10-minuten'];

  const wanted = mood <= 2 ? preferLow : mood >= 4 ? preferHigh : preferNeutral;

  // zoek eerst een gewenste slug
  let dest: string | null = null;
  for (const slug of wanted) {
    const { data } = await sb.from('meditations').select('slug').eq('slug', slug).maybeSingle();
    if (data?.slug) { dest = `/m/${data.slug}`; break; }
  }
  // anders pak iets gratis
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
  if (!user) {
    redirect('/login');
  }
  const key = { user_id: user.id, meditation_id: meditationId };

  const { data: existing } = await sb
    .from('favorites')
    .select('meditation_id')
    .match(key)
    .maybeSingle();

  if (existing) {
    await sb.from('favorites').delete().match(key);
  } else {
    await sb.from('favorites').insert(key);
  }
  revalidatePath(pathToRevalidate);
}
