'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
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
        setError(payload?.error ?? 'Login tidak dapat diproses. Coba lagi.');
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError('Koneksi gagal. Periksa internet Anda lalu coba lagi.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Pesmad App</p>
        <h1 id="login-title">Masuk</h1>
        <p className="auth-intro">Gunakan akun internal Pesmad untuk melanjutkan.</p>

        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" type="text" autoComplete="username" required disabled={pending} />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required disabled={pending} />
        </div>

        {error ? (
          <p className="form-error" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}

        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? 'Memproses…' : 'Masuk'}
        </button>
        <p className="form-status" role="status" aria-live="polite">
          {pending ? 'Sedang memeriksa akun Anda.' : ''}
        </p>
      </section>
    </form>
  );
}
