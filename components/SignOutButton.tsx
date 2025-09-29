'use client';
import { useState } from 'react';

export default function SignOutButton({ className = 'btn ghost' }:{ className?: string }) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } finally {
      window.location.href = '/';
    }
  }
  return (
    <button className={className} onClick={handle} disabled={loading}>
      {loading ? 'Bezig…' : 'Uitloggen'}
    </button>
  );
}
