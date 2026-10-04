import { describe, expect, it, vi } from 'vitest';
import {
  SESSION_MAX_AGE_MS,
  createPesmadSessionWith,
  readPesmadSessionWith,
  sessionCookieName,
  sessionCookieOptions,
} from '../../src/lib/auth/session';
import type { PesmadUser } from '../../src/lib/identity/types';

const activeUser: PesmadUser = {
  authUid: 'uid-1',
  legacyUserId: 'legacy-1',
  username: 'ustadz01',
  usernameNormalized: 'ustadz01',
  nama: 'Ustadz Satu',
  role: 'Ustadz',
  active: true,
  modules: {
    tahfidz: 'user',
    kinerja: 'user',
    keuangan: 'none',
    diniyah: 'none',
    santri: 'none',
    laporan: 'none',
  },
  createdAt: '2026-10-04T00:00:00.000Z',
  updatedAt: '2026-10-04T00:00:00.000Z',
};

describe('Pesmad server session', () => {
  it('uses a five-day Firebase session lifetime', async () => {
    const createSessionCookie = vi.fn().mockResolvedValue('signed-cookie');

    await expect(createPesmadSessionWith({ createSessionCookie }, 'id-token')).resolves.toBe('signed-cookie');
    expect(createSessionCookie).toHaveBeenCalledWith('id-token', { expiresIn: SESSION_MAX_AGE_MS });
    expect(SESSION_MAX_AGE_MS).toBe(5 * 24 * 60 * 60 * 1000);
  });

  it('uses __Host cookie security in production and a localhost-safe name in development', () => {
    expect(sessionCookieName('production')).toBe('__Host-pesmad_session');
    expect(sessionCookieName('development')).toBe('pesmad_session');
    expect(sessionCookieOptions('production')).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 5 * 24 * 60 * 60,
    });
    expect(sessionCookieOptions('development')).toMatchObject({ secure: false, path: '/' });
  });

  it('verifies the Firebase cookie then re-reads the current Pesmad profile', async () => {
    const verifySessionCookie = vi.fn().mockResolvedValue({ uid: 'uid-1' });
    const getIdentityByAuthUid = vi.fn().mockResolvedValue(activeUser);

    await expect(
      readPesmadSessionWith({ verifySessionCookie }, getIdentityByAuthUid, 'signed-cookie'),
    ).resolves.toEqual(activeUser);
    expect(verifySessionCookie).toHaveBeenCalledWith('signed-cookie', true);
    expect(getIdentityByAuthUid).toHaveBeenCalledWith('uid-1');
  });

  it('denies missing, invalid, deleted, or inactive profiles', async () => {
    const verifySessionCookie = vi.fn().mockResolvedValue({ uid: 'uid-1' });
    const getIdentityByAuthUid = vi.fn().mockResolvedValue({ ...activeUser, active: false });

    await expect(readPesmadSessionWith({ verifySessionCookie }, getIdentityByAuthUid, undefined)).resolves.toBeNull();
    await expect(
      readPesmadSessionWith({ verifySessionCookie }, getIdentityByAuthUid, 'signed-cookie'),
    ).resolves.toBeNull();

    verifySessionCookie.mockRejectedValueOnce(new Error('revoked'));
    await expect(
      readPesmadSessionWith({ verifySessionCookie }, getIdentityByAuthUid, 'bad-cookie'),
    ).resolves.toBeNull();
  });
});
