import { getAdminAuth } from '../firebase/admin';
import { getIdentityByAuthUid } from '../identity/repository';
import type { PesmadUser } from '../identity/types';

export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export function sessionCookieName(environment = process.env.NODE_ENV): string {
  return environment === 'production' ? '__Host-pesmad_session' : 'pesmad_session';
}

export function sessionCookieOptions(environment = process.env.NODE_ENV) {
  return {
    httpOnly: true as const,
    secure: environment === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_MS / 1000,
  };
}

type SessionCreator = {
  createSessionCookie(idToken: string, options: { expiresIn: number }): Promise<string>;
};

type SessionVerifier = {
  verifySessionCookie(cookie: string, checkRevoked?: boolean): Promise<{ uid: string }>;
};

export async function createPesmadSessionWith(auth: SessionCreator, idToken: string): Promise<string> {
  return auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

export async function readPesmadSessionWith(
  auth: SessionVerifier,
  getIdentity: (authUid: string) => Promise<PesmadUser | null>,
  cookieValue: string | undefined,
): Promise<PesmadUser | null> {
  if (!cookieValue) return null;

  try {
    const decoded = await auth.verifySessionCookie(cookieValue, true);
    const identity = await getIdentity(decoded.uid);
    if (!identity?.active) return null;
    return identity;
  } catch {
    return null;
  }
}

export async function createPesmadSession(idToken: string): Promise<string> {
  return createPesmadSessionWith(getAdminAuth(), idToken);
}

export async function readPesmadSession(cookieValue: string | undefined): Promise<PesmadUser | null> {
  return readPesmadSessionWith(getAdminAuth(), getIdentityByAuthUid, cookieValue);
}
