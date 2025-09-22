'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://www.awaren.app/auth/callback',
      },
    });
    if (error) {
      alert(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main style={{ maxWidth: 420, margin: '40px auto', padding: '0 16px' }}>
      <h1>Inloggen</h1>
      {sent ? (
        <p>Check je e mail en klik op de link</p>
      ) : (
        <form onSubmit={onSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jij@voorbeeld.nl"
            style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #ddd' }}
          />
          <button className="btn" style={{ marginTop: 12 }}>Stuur login link</button>
          <style jsx>{`
            .btn{background:#1E4E3A;color:#fff;border:0;border-radius:999px;padding:12px 18px;font-weight:700}
          `}</style>
        </form>
      )}
    </main>
  );
}
