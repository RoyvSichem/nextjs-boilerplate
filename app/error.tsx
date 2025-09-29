'use client';

export default function Error({
  error,
  reset,
}: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <main className="container section">
      <h1>Er ging iets mis</h1>
      <p className="muted">Probeer het nog eens, of vernieuw de pagina.</p>
      <button className="btn" onClick={() => reset()}>Opnieuw</button>
    </main>
  );
}
