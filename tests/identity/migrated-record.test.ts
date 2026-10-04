import { describe, expect, it } from 'vitest';
import { buildMigratedIdentity } from '../../src/lib/identity/repository';

describe('migrated Pesmad identity record', () => {
  it('contains profile and default access but never a password field', () => {
    const record = buildMigratedIdentity(
      {
        legacyUserId: 'legacy-1',
        username: 'Ustadz01',
        nama: 'Ustadz Satu',
        role: 'Ustadz',
        authUid: 'firebase-1',
      },
      '2026-10-04T09:00:00.000Z',
    );

    expect(record).toMatchObject({
      authUid: 'firebase-1',
      legacyUserId: 'legacy-1',
      username: 'Ustadz01',
      usernameNormalized: 'ustadz01',
      nama: 'Ustadz Satu',
      role: 'Ustadz',
      active: true,
      modules: { tahfidz: 'user', kinerja: 'user' },
      createdAt: '2026-10-04T09:00:00.000Z',
      updatedAt: '2026-10-04T09:00:00.000Z',
    });
    expect(record).not.toHaveProperty('password');
  });
});
