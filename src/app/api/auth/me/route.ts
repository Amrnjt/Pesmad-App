import { NextResponse } from 'next/server';
import { readPesmadSession, sessionCookieName } from '../../../../lib/auth/session';
import type { PesmadUser } from '../../../../lib/identity/types';

const noStoreHeaders = { 'cache-control': 'private, no-store' };

type SessionReader = (cookieValue: string | undefined) => Promise<PesmadUser | null>;

function readCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;

  const prefix = name + '=';
  const pair = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return pair ? decodeURIComponent(pair.slice(prefix.length)) : undefined;
}

export async function handleMeRequest(
  cookieValue: string | undefined,
  readSession: SessionReader = readPesmadSession,
): Promise<Response> {
  const profile = await readSession(cookieValue);

  if (!profile) {
    return NextResponse.json(
      { error: 'Tidak terautentikasi.' },
      { status: 401, headers: noStoreHeaders },
    );
  }

  return NextResponse.json(
    { profile },
    { status: 200, headers: noStoreHeaders },
  );
}

export async function GET(request: Request): Promise<Response> {
  const cookieValue = readCookie(
    request.headers.get('cookie'),
    sessionCookieName(),
  );

  return handleMeRequest(cookieValue);
}
