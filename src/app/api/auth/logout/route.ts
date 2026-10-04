import { NextResponse } from 'next/server';
import { readPesmadSession, sessionCookieName, sessionCookieOptions } from '../../../../lib/auth/session';

const noStoreHeaders = { 'cache-control': 'no-store' };

export function handleLogoutRequest(environment = process.env.NODE_ENV): Response {
  const response = NextResponse.json(
    { ok: true },
    { status: 200, headers: noStoreHeaders },
  );

  response.cookies.set(sessionCookieName(environment), '', {
    ...sessionCookieOptions(environment),
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function POST(): Promise<Response> {
  return handleLogoutRequest();
}
