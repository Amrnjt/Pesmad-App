import { describe, expect, it } from 'vitest';
import { getAccessibleModules } from '../../src/lib/identity/modules';
import { defaultModuleAccessForRole, type PesmadUser } from '../../src/lib/identity/types';

function createMockUser(role: 'Superadmin' | 'Pimpinan' | 'Ustadz', overrides = {}): PesmadUser {
  return {
    authUid: 'test-uid',
    legacyUserId: 'legacy-1',
    username: 'testuser',
    usernameNormalized: 'testuser',
    nama: 'Pengguna Uji',
    role,
    active: true,
    modules: defaultModuleAccessForRole(role),
    createdAt: '2026-10-04T00:00:00.000Z',
    updatedAt: '2026-10-04T00:00:00.000Z',
    ...overrides,
  };
}

describe('getAccessibleModules', () => {
  it('shows only active modules for Ustadz role', () => {
    const ustadz = createMockUser('Ustadz');
    const modules = getAccessibleModules(ustadz);

    expect(modules.map((m) => m.id)).toEqual(['tahfidz', 'kinerja']);
    expect(modules.every((m) => m.access === 'Pengguna')).toBe(true);
    expect(modules.map((m) => m.name)).toEqual(['Smart Tahfidz', 'Sistem Kinerja']);
  });

  it('shows only active modules for Pimpinan role with Lihat access', () => {
    const pimpinan = createMockUser('Pimpinan');
    const modules = getAccessibleModules(pimpinan);

    expect(modules.map((m) => m.id)).toEqual(['tahfidz', 'kinerja']);
    expect(modules.every((m) => m.access === 'Lihat')).toBe(true);
  });

  it('shows only active modules for Superadmin role with Administrator access', () => {
    const superadmin = createMockUser('Superadmin');
    const modules = getAccessibleModules(superadmin);

    expect(modules.map((m) => m.id)).toEqual(['tahfidz', 'kinerja']);
    expect(modules.every((m) => m.access === 'Administrator')).toBe(true);
  });

  it('excludes modules where access is none even if present in user record', () => {
    const customUser = createMockUser('Ustadz', {
      modules: {
        tahfidz: 'user',
        kinerja: 'none',
        keuangan: 'none',
        diniyah: 'user',
        santri: 'none',
        laporan: 'none',
      },
    });

    const modules = getAccessibleModules(customUser);
    expect(modules.map((m) => m.id)).toEqual(['tahfidz', 'diniyah']);
  });

  it('excludes modules with unknown access values, invalid types, or unexpected permissions', () => {
    const userWithInvalidAccess = createMockUser('Ustadz', {
      modules: {
        tahfidz: 'user',
        kinerja: 'superuser', // unknown value
        keuangan: 'read-write', // unknown value
        diniyah: 'guest', // unknown value
        santri: 123, // invalid type
        laporan: null, // invalid type
      },
    });

    const modules = getAccessibleModules(userWithInvalidAccess);
    expect(modules.map((m) => m.id)).toEqual(['tahfidz']);
    expect(modules[0]?.access).toBe('Pengguna');
  });

  it('handles empty or missing modules safely', () => {
    const emptyUser = createMockUser('Ustadz', { modules: {} });
    expect(getAccessibleModules(emptyUser)).toEqual([]);
  });
});

