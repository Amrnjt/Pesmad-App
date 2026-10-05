import { NextResponse } from 'next/server';
import { signInFirebasePassword } from '../../../../lib/auth/firebasePasswordSignIn';
import { verifyLegacyCredential } from '../../../../lib/auth/legacyCredentialVerifier';
import { authenticatePesmadCredentials, PesmadLoginError } from '../../../../lib/auth/loginService';
import { getAdminAuth } from '../../../../lib/firebase/admin';
import {
  createPesmadSession,
  sessionCookieName,
  sessionCookieOptions,
} from '../../../../lib/auth/session';
import { createMigratedIdentity, getIdentityByUsername } from '../../../../lib/identity/repository';
import type { PesmadUser } from '../../../../lib/identity/types';

type Authenticate = (input: { username: string; password: string }) => Promise<{
  identity: PesmadUser;
  idToken: string;
}>;

type SessionCreator = (idToken: string) => Promise<string>;

const noStoreHeaders = { 'cache-control': 'no-store' };

function isLoginBody(body: unknown): body is { username: string; password: string } {
  if (!body || typeof body !== 'object') return false;
  const candidate = body as Record<string, unknown>;
  return typeof candidate.username === 'string' && typeof candidate.password === 'string';
}

export async function handleLoginRequest(
  body: unknown,
  authenticate: Authenticate,
  createSession: SessionCreator = createPesmadSession,
  environment = process.env.NODE_ENV,
): Promise<Response> {
  if (!isLoginBody(body)) {
    return NextResponse.json(
      { error: 'Permintaan login tidak valid.' },
      { status: 400, headers: noStoreHeaders },
    );
  }

  try {
    const result = await authenticate({ username: body.username, password: body.password });
    const session = await createSession(result.idToken);
    const response = NextResponse.json(
      { profile: result.identity },
      { status: 200, headers: noStoreHeaders },
    );

    response.cookies.set(
      sessionCookieName(environment),
      session,
      sessionCookieOptions(environment),
    );

    return response;
  } catch (error) {
    if (error instanceof PesmadLoginError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: noStoreHeaders },
      );
    }

    return NextResponse.json(
      { error: 'Login tidak dapat diproses.' },
      { status: 500, headers: noStoreHeaders },
    );
  }
}

async function authenticateWithProductionDependencies(input: { username: string; password: string }) {
  return authenticatePesmadCredentials(input, {
    getIdentityByUsername,
    verifyLegacyCredential,
    createFirebaseUser: async ({ email, password, displayName }) => {
      const user = await getAdminAuth().createUser({ email, password, displayName });
      return { uid: user.uid };
    },
    deleteFirebaseUser: async (uid) => {
      await getAdminAuth().deleteUser(uid);
    },
    createMigratedIdentity,
    signInFirebasePassword,
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Permintaan login tidak valid.' },
      { status: 400, headers: noStoreHeaders },
    );
  }

  return handleLoginRequest(body, authenticateWithProductionDependencies);
}
