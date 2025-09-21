import { supabaseServer } from '../../lib/supabase';
import AdminUploader from '../../components/AdminUploader';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return <main className="container"><p>Geen toegang</p></main>;

  const { data: me } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!me || me.role !== 'admin') return <main className="container"><p>Geen toegang</p></main>;

  // data voor dropdowns
  const { data: cats } = await sb.from('categories').select('id,title');

  async function createCategory(formData: FormData) {
    'use server';
    const sb2 = await supabaseServer();
    const title = String(formData.get('title') || '');
    const slug  = String(formData.get('slug')  || '');
    const description = String(formData.get('description') || '');
    await sb2.from('categories').insert({ title, slug, description });
  }

  async function createMeditation(formData: FormData) {
    'use server';
    const sb2 = await supabaseServer();
    const title = String(formData.get('title') || '');
    const slug  = String(formData.get('slug')  || '');
    const subtitle = String(formData.get('subtitle') || '');
    const description = String(formData.get('description') || '');
    const category_id = Number(formData.get('category_id'));
    const audio_url = String(formData.get('audio_url') || '');
    const cover_url = String(formData.get('cover_url') || '');
    const duration_seconds = Number(formData.get('duration_seconds') || 0);
    const is_free = formData.get('is_free') === 'on';
    await sb2.from('meditations').insert({
      title, slug, subtitle, description,
      category_id, audio_url, cover_url,
      duration_seconds, is_free
    });
  }

  return (
    <main className="container" style={{padding:'24px 0'}}>
      <section className="section">
        <h1>Admin</h1>
        <p className="lead">Upload audio en covers, maak categorieën en meditaties</p>
      </section>

      <section className="section">
        <h2>Bestanden uploaden</h2>
        <AdminUploader />
        <p className="lead">Plak de verkregen URL’s hieronder</p>
      </section>

      <section className="section" style={{display:'grid', gap:24}}>
        <div className="card">
          <h2>Nieuwe categorie</h2>
          <form action={createCategory} style={{display:'grid', gap:10, marginTop:10}}>
            <input name="title" placeholder="Titel" required style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}}/>
            <input name="slug" placeholder="slug bijvoorbeeld bodyscan" required style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}}/>
            <textarea name="description" placeholder="Beschrijving" rows={3} style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}} />
            <button className="btn" type="submit">Categorie maken</button>
          </form>
        </div>

        <div className="card">
          <h2>Nieuwe meditatie</h2>
          <form action={createMeditation} style={{display:'grid', gap:10, marginTop:10}}>
            <input name="title" placeholder="Titel" required style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}}/>
            <input name="slug" placeholder="slug bijvoorbeeld bodyscan-10-minuten" required style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}}/>
            <input name="subtitle" placeholder="Subtitel" style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}}/>
            <select name="category_id" required style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}}>
              <option value="">Kies categorie</option>
              {cats?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input name="audio_url" placeholder="Audio URL uit bucket audio" required style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}}/>
            <input name="cover_url" placeholder="Cover URL uit bucket covers" style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}}/>
            <input name="duration_seconds" type="number" placeholder="Duur in seconden" style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}}/>
            <label style={{display:'flex', gap:8, alignItems:'center'}}>
              <input type="checkbox" name="is_free" /> Gratis te beluisteren
            </label>
            <textarea name="description" placeholder="Beschrijving, HTML mag" rows={5} style={{padding:10, borderRadius:10, border:'1px solid #e5e7eb'}} />
            <button className="btn" type="submit">Meditatie maken</button>
          </form>
        </div>
      </section>
    </main>
  );
}
