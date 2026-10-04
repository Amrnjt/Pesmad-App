export type ModuleAccess = 'none' | 'view' | 'user' | 'admin';
export type PesmadRole = 'Superadmin' | 'Pimpinan' | 'Ustadz';
export type ModuleId = 'tahfidz' | 'kinerja' | 'keuangan' | 'diniyah' | 'santri' | 'laporan';

export type ModuleAccessMap = Record<ModuleId, ModuleAccess>;

export interface LegacyInternalUser {
  legacyUserId: string;
  username: string;
  nama: string;
  role: PesmadRole;
}

export interface PesmadUser {
  authUid: string;
  legacyUserId: string;
  username: string;
  usernameNormalized: string;
  nama: string;
  role: PesmadRole;
  active: boolean;
  modules: ModuleAccessMap;
  createdAt: string;
  updatedAt: string;
}

export function defaultModuleAccessForRole(role: PesmadRole): ModuleAccessMap {
  const activeAccess: ModuleAccess = role === 'Superadmin' ? 'admin' : role === 'Pimpinan' ? 'view' : 'user';
  return {
    tahfidz: activeAccess,
    kinerja: activeAccess,
    keuangan: 'none',
    diniyah: 'none',
    santri: 'none',
    laporan: 'none',
  };
}
