export class FirebasePasswordSignInError extends Error {
  constructor(public readonly code: string, public readonly status: number) {
    super(`Firebase password sign-in failed: ${code}`);
    this.name = 'FirebasePasswordSignInError';
  }
}

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export async function signInFirebasePasswordWith(
  fetcher: Fetcher,
  apiKey: string,
  input: { email: string; password: string },
): Promise<{ idToken: string; localId: string }> {
  const response = await fetcher(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        returnSecureToken: true,
      }),
      cache: 'no-store',
    },
  );

  const payload = (await response.json()) as {
    idToken?: string;
    localId?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.idToken || !payload.localId) {
    throw new FirebasePasswordSignInError(
      payload.error?.message || 'UNKNOWN_AUTH_ERROR',
      response.status,
    );
  }

  return { idToken: payload.idToken, localId: payload.localId };
}

export async function signInFirebasePassword(input: {
  email: string;
  password: string;
}): Promise<{ idToken: string; localId: string }> {
  const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing required server environment variable: FIREBASE_WEB_API_KEY');
  return signInFirebasePasswordWith(fetch, apiKey, input);
}
