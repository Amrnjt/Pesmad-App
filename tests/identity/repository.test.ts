import { describe, expect, it } from 'vitest';
import { defaultModuleAccessForRole } from '../../src/lib/identity/types';

describe('default Pesmad module access', () => {
  it('grants Superadmin admin access to active V1 modules only', () => {
    expect(defaultModuleAccessForRole('Superadmin')).toEqual({
      tahfidz: 'admin',
      kinerja: 'admin',
      keuangan: 'none',
      diniyah: 'none',
      santri: 'none',
      laporan: 'none',
    });
  });

  it('grants Pimpinan view access to active V1 modules only', () => {
    expect(defaultModuleAccessForRole('Pimpinan')).toEqual({
      tahfidz: 'view',
      kinerja: 'view',
      keuangan: 'none',
      diniyah: 'none',
      santri: 'none',
      laporan: 'none',
    });
  });

  it('grants Ustadz user access to active V1 modules only', () => {
    expect(defaultModuleAccessForRole('Ustadz')).toEqual({
      tahfidz: 'user',
      kinerja: 'user',
      keuangan: 'none',
      diniyah: 'none',
      santri: 'none',
      laporan: 'none',
    });
  });
});
