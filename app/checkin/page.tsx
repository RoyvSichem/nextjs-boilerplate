import { createCheckinAction } from '../../lib/actions';

export const dynamic = 'force-dynamic';

export default function CheckinPage() {
  return (
    <main style={{maxWidth:520, margin:'24px auto', padding:'0 16px'}}>
      <h1>Hoe is het nu met je</h1>
      <p className="lead">Kies het beste wat bij dit moment past, je krijgt daarna een passende oefening</p>

      <form action={createCheckinAction} style={{display:'grid', gap:14, marginTop:16}}>
        <div style={{display:'grid', gap:8}}>
          <label style={{display:'flex', gap:10, alignItems:'center'}}>
            <input type="radio" name="mood" value="1" required /> Onrustig
          </label>
          <label style={{display:'flex', gap:10, alignItems:'center'}}>
            <input type="radio" name="mood" value="2" /> Gestrest
          </label>
          <label style={{display:'flex', gap:10, alignItems:'center'}}>
            <input type="radio" name="mood" value="3" /> Neutraal
          </label>
          <label style={{display:'flex', gap:10, alignItems:'center'}}>
            <input type="radio" name="mood" value="4" /> Rustig
          </label>
          <label style={{display:'flex', gap:10, alignItems:'center'}}>
            <input type="radio" name="mood" value="5" /> Energiek
          </label>
        </div>

        <textarea name="note" placeholder="Wil je iets toelichten" rows={3}
          style={{padding:12, borderRadius:12, border:'1px solid #e5e7eb'}} />

        <button className="btn" type="submit">Opslaan en ga verder</button>
      </form>
    </main>
  );
}
