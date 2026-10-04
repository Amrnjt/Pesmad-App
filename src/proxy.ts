import { NextRequest, NextResponse } from 'next/server';
import { sessionCookieName } from './src/lib/auth/session';

const PROTECTED_PREFIXES = ['/dashboard', '/admin'];

function isProtectedNavigation(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest): Promise<Response> {
  if (!isProtectedNavigation(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(sessionCookieName())?.value;
  if (session) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  loginUrl.searchParams.set(
    'next',
    request.nextUrl.pathname + request.nextUrl.search,
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
