'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type LoginResponse = {
  error?: string;
};

function safeNextPath(value: string | null): string {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = (await response.json()) as LoginResponse;

      if (!response.ok) {
        setError(result.error || 'Login tidak dapat diproses. Coba lagi.');
        return;
      }

      router.replace(safeNextPath(searchParams.get('next')));
      router.refresh();
    } catch {
      setError('Koneksi terganggu. Periksa internet Anda lalu coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="username">Nama pengguna</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Kata sandi</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Memeriksa akun…' : 'Masuk'}
      </button>
      <p className="form-status" role="status" aria-live="polite">
        {isSubmitting ? 'Sedang memeriksa akun Anda.' : ''}
      </p>
    </form>
  );
}
