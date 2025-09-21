'use client';
export default function Subscribe(){
  const start = async ()=>{
    const r = await fetch('/api/checkout', { method:'POST' });
    const { url } = await r.json();
    window.location.href = url;
  };
  return (
    <main style={{maxWidth:560, margin:'40px auto', padding:'0 16px', textAlign:'center'}}>
      <h1>Word lid</h1>
      <p>Onbeperkt meditaties voor €4,95 per maand</p>
      <button onClick={start} className="btn">Naar betalen</button>
      <style jsx>{`.btn{background:#1E4E3A;color:#fff;border:0;border-radius:999px;padding:12px 18px;font-weight:700}`}</style>
    </main>
  );
}
