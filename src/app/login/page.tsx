import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { readPesmadSession, sessionCookieName } from '@/lib/auth/session';

interface LoginPageProps {
  searchParams?: Promise<{ next?: string | string[] }>;
}

function safeNextPath(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (
    !candidate ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    /^\/%2f/i.test(candidate)
  ) {
    return '/dashboard';
  }

  return candidate;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies();
  const profile = await readPesmadSession(cookieStore.get(sessionCookieName())?.value);
  if (profile) redirect('/dashboard');

  const params = await searchParams;

  return (
    <main className="auth-shell">
      <LoginForm nextPath={safeNextPath(params?.next)} />
    </main>
  );
}
