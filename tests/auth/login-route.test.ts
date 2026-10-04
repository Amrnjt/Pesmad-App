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
  it('returns token/profile with no-store for valid credentials', async () => {
    const authenticate = vi.fn().mockResolvedValue({ identity, idToken: 'token-1' });
    const response = await handleLoginRequest({ username: 'ustadz01', password: 'secret' }, authenticate);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({ profile: identity, idToken: 'token-1' });
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
