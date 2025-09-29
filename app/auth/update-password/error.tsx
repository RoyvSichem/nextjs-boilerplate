'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container" style={{ maxWidth: 520, padding: '24px 0' }}>
      <h1>Er ging iets mis</h1>
      <p style={{ color: '#b91c1c' }}>{error.message}</p>
      <button className="btn" onClick={() => reset()}>Probeer opnieuw</button>
    </main>
  );
}
