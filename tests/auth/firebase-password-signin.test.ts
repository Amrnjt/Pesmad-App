import { describe, expect, it, vi } from 'vitest';
import { signInFirebasePasswordWith } from '../../src/lib/auth/firebasePasswordSignIn';

describe('Firebase password sign-in adapter', () => {
  it('posts credentials to Identity Toolkit and returns only token identity fields', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ idToken: 'id-token', localId: 'uid-1', refreshToken: 'refresh-secret' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const result = await signInFirebasePasswordWith(fetcher, 'api-key', {
      email: 'pesmad.hash@auth.tahfidzpesmad.my.id',
      password: 'secret',
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=api-key',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'pesmad.hash@auth.tahfidzpesmad.my.id',
          password: 'secret',
          returnSecureToken: true,
        }),
      }),
    );
    expect(result).toEqual({ idToken: 'id-token', localId: 'uid-1' });
  });

  it('rejects a failed Firebase response without echoing the password', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'INVALID_LOGIN_CREDENTIALS' } }), { status: 400 }),
    );

    await expect(
      signInFirebasePasswordWith(fetcher, 'api-key', {
        email: 'pesmad.hash@auth.tahfidzpesmad.my.id',
        password: 'super-secret',
      }),
    ).rejects.not.toThrow('super-secret');
  });
});
