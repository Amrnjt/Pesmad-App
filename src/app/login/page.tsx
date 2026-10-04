import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { readPesmadSession, sessionCookieName } from '@/lib/auth/session';

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

function safeNextPath(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.startsWith('/') && !candidate.startsWith('//') ? candidate : '/dashboard';
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies();
  const profile = await readPesmadSession(cookieStore.get(sessionCookieName())?.value);
  if (profile) redirect('/dashboard');

  const query = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Pesmad App</p>
        <h1 id="login-title">Masuk ke akun Anda</h1>
        <p className="auth-intro">Gunakan akun internal Pesmad untuk melanjutkan.</p>
        <LoginForm redirectTo={safeNextPath(query.next)} />
      </section>
    </main>
  );
}
