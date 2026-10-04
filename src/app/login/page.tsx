import { LoginForm } from '@/components/auth/LoginForm';

interface LoginPageProps {
  searchParams?: Promise<{ next?: string }>;
}

function safeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard';
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="login-shell">
      <LoginForm nextPath={safeNextPath(params?.next)} />
    </main>
  );
}
