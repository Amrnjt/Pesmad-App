'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState('');

  async function signOut() {
    setIsSigningOut(true);
    setError('');

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Logout gagal');

      router.replace('/login');
      router.refresh();
    } catch {
      setError('Sesi belum dapat diakhiri. Coba lagi.');
      setIsSigningOut(false);
    }
  }

  return (
    <div className="logout-control">
      <button className="secondary-button" type="button" onClick={signOut} disabled={isSigningOut}>
        {isSigningOut ? 'Keluar…' : 'Keluar'}
      </button>
      {error ? <span className="logout-error" role="alert">{error}</span> : null}
    </div>
  );
}
