'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  nextPath?: string;
}

export function LoginForm({ nextPath = '/dashboard' }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') ?? '');
    const password = String(formData.get('password') ?? '');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? 'Login tidak dapat diproses.');
        return;
      }

      const safeNextPath = nextPath.startsWith('/') && !nextPath.startsWith('//')
        ? nextPath
        : '/dashboard';

      router.replace(safeNextPath);
    } catch {
      setError('Koneksi gagal. Silakan coba lagi.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="login-card">
        <p className="eyebrow">Pesmad App</p>
        <h1>Masuk</h1>
        <p>Gunakan username dan password Pesmad Anda.</p>

        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" autoComplete="username" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />

        {error ? (
          <p role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={pending}>
          {pending ? 'Memproses…' : 'Masuk'}
        </button>
      </div>
    </form>
  );
}
