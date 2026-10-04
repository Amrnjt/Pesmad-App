import { describe, expect, it, vi } from 'vitest';
import {
  authenticatePesmadCredentials,
  UnsupportedLegacyRoleError,
  type LoginDependencies,
} from '../../src/lib/auth/loginService';
import type { LegacyInternalUser, PesmadUser } from '../../src/lib/identity/types';

const legacyUser: LegacyInternalUser = {
  legacyUserId: 'usr-1',
  username: 'Ustadz01',
  nama: 'Ustadz Satu',
  role: 'Ustadz',
};

const migratedUser: PesmadUser = {
  authUid: 'firebase-1',
  legacyUserId: 'usr-1',
  username: 'Ustadz01',
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

function dependencies(overrides: Partial<LoginDependencies> = {}): LoginDependencies {
  return {
    getIdentityByUsername: vi.fn().mockResolvedValue(null),
    verifyLegacyCredential: vi.fn().mockResolvedValue(legacyUser),
    createFirebaseUser: vi.fn().mockResolvedValue({ uid: 'firebase-1' }),
    deleteFirebaseUser: vi.fn().mockResolvedValue(undefined),
    createMigratedIdentity: vi.fn().mockResolvedValue(migratedUser),
    signInFirebasePassword: vi.fn().mockResolvedValue({ idToken: 'token-1', localId: 'firebase-1' }),
    ...overrides,
  };
}

describe('lazy Pesmad credential migration', () => {
  it('migrates a valid internal legacy user once and preserves the submitted password only in auth calls', async () => {
    const deps = dependencies();

    const result = await authenticatePesmadCredentials(
      { username: '  Ustadz01 ', password: 'legacy-secret' },
      deps,
    );

    expect(result.identity).toEqual(migratedUser);
    expect(result.idToken).toBe('token-1');
    expect(deps.verifyLegacyCredential).toHaveBeenCalledWith({
      username: 'Ustadz01',
      password: 'legacy-secret',
    });
    expect(deps.createFirebaseUser).toHaveBeenCalledWith({
      email: 'pesmad.d81a4d3803f6ea754d98716b28716fef@auth.tahfidzpesmad.my.id',
      password: 'legacy-secret',
      displayName: 'Ustadz Satu',
    });
    expect(deps.createMigratedIdentity).toHaveBeenCalledWith({ ...legacyUser, authUid: 'firebase-1' });
    expect(JSON.stringify(result.identity)).not.toContain('legacy-secret');
  });

  it('uses Firebase sign-in directly for an already migrated identity', async () => {
    const deps = dependencies({ getIdentityByUsername: vi.fn().mockResolvedValue(migratedUser) });

    await authenticatePesmadCredentials({ username: 'Ustadz01', password: 'same-secret' }, deps);

    expect(deps.verifyLegacyCredential).not.toHaveBeenCalled();
    expect(deps.createFirebaseUser).not.toHaveBeenCalled();
    expect(deps.signInFirebasePassword).toHaveBeenCalledWith({
      email: 'pesmad.d81a4d3803f6ea754d98716b28716fef@auth.tahfidzpesmad.my.id',
      password: 'same-secret',
    });
  });

  it('returns 401 semantics for an invalid legacy password and creates nothing', async () => {
    const deps = dependencies({ verifyLegacyCredential: vi.fn().mockResolvedValue(null) });

    await expect(
      authenticatePesmadCredentials({ username: 'Ustadz01', password: 'wrong' }, deps),
    ).rejects.toMatchObject({ status: 401 });

    expect(deps.createFirebaseUser).not.toHaveBeenCalled();
    expect(deps.createMigratedIdentity).not.toHaveBeenCalled();
  });

  it('returns 403 semantics for Wali or Santri legacy accounts and creates nothing', async () => {
    const deps = dependencies({
      verifyLegacyCredential: vi.fn().mockRejectedValue(new UnsupportedLegacyRoleError()),
    });

    await expect(
      authenticatePesmadCredentials({ username: 'wali01', password: 'valid' }, deps),
    ).rejects.toMatchObject({ status: 403 });

    expect(deps.createFirebaseUser).not.toHaveBeenCalled();
    expect(deps.createMigratedIdentity).not.toHaveBeenCalled();
  });

  it('rolls back a newly created Firebase user if profile creation fails', async () => {
    const deps = dependencies({
      createMigratedIdentity: vi.fn().mockRejectedValue(new Error('profile write failed')),
    });

    await expect(
      authenticatePesmadCredentials({ username: 'Ustadz01', password: 'legacy-secret' }, deps),
    ).rejects.toThrow('profile write failed');

    expect(deps.deleteFirebaseUser).toHaveBeenCalledWith('firebase-1');
  });
});
