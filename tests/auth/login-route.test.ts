import { describe, expect, it, vi } from 'vitest';
import { handleLoginRequest } from '../../src/app/api/auth/login/route';
import { PesmadLoginError } from '../../src/lib/auth/loginService';

const identity = {
  authUid: 'uid-1',
  legacyUserId: 'legacy-1',
  username: 'ustadz01',
  usernameNormalized: 'ustadz01',
  nama: 'Ustadz Satu',
  role: 'Ustadz' as const,
  active: true,
  modules: {
    tahfidz: 'user' as const,
    kinerja: 'user' as const,
    keuangan: 'none' as const,
    diniyah: 'none' as const,
    santri: 'none' as const,
    laporan: 'none' as const,
  },
  createdAt: '2026-10-04T00:00:00.000Z',
  updatedAt: '2026-10-04T00:00:00.000Z',
};

describe('Pesmad login HTTP boundary', () => {
  it('returns only the sanitized profile with no-store for valid credentials', async () => {
    const authenticate = vi.fn().mockResolvedValue({ identity, idToken: 'server-only-token' });
    const createSession = vi.fn().mockResolvedValue('signed-session-cookie');
    const response = await handleLoginRequest(
      { username: 'ustadz01', password: 'secret' },
      authenticate,
      createSession,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const payload = await response.json();
    expect(payload).toEqual({ profile: identity });
    expect(JSON.stringify(payload)).not.toContain('server-only-token');
  });

  it('exchanges the server-only ID token for a secure production session cookie', async () => {
    const authenticate = vi.fn().mockResolvedValue({ identity, idToken: 'server-only-token' });
    const createSession = vi.fn().mockResolvedValue('signed-session-cookie');

    const response = await handleLoginRequest(
      { username: 'ustadz01', password: 'secret' },
      authenticate,
      createSession,
      'production',
    );

    expect(createSession).toHaveBeenCalledWith('server-only-token');
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('__Host-pesmad_session=signed-session-cookie');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Secure');
    expect(setCookie).toContain('SameSite=lax');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('Max-Age=432000');
    expect(await response.json()).toEqual({ profile: identity });
  });

  it.each([401, 403])('maps PesmadLoginError status %s without leaking credentials', async (status) => {
    const authenticate = vi.fn().mockRejectedValue(new PesmadLoginError(status, 'Akses ditolak.'));
    const response = await handleLoginRequest({ username: 'user', password: 'secret-value' }, authenticate);

    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.text()).not.toContain('secret-value');
  });

  it('returns 400 for malformed body', async () => {
    const authenticate = vi.fn();
    const response = await handleLoginRequest({ username: 1 }, authenticate);

    expect(response.status).toBe(400);
    expect(authenticate).not.toHaveBeenCalled();
  });
});
