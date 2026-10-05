import type { ModuleId, PesmadUser } from './types';

export const MODULE_LABELS: Record<ModuleId, string> = {
  tahfidz: 'Smart Tahfidz',
  kinerja: 'Sistem Kinerja',
  keuangan: 'Keuangan',
  diniyah: 'Diniyah',
  santri: 'Data Santri',
  laporan: 'Laporan',
};

export const MODULE_DESCRIPTIONS: Record<ModuleId, string> = {
  tahfidz: 'Pencatatan ziyadah, murajaah, dan evaluasi hafalan santri.',
  kinerja: 'Pemantauan indikator kinerja, pelaporan, dan evaluasi tugas.',
  keuangan: 'Manajemen syahriah, transaksi kas, dan pembukuan pesantren.',
  diniyah: 'Kurikulum keagamaan, kitab kuning, dan jadwal taklim.',
  santri: 'Data induk santri, kamar, perizinan, dan riwayat kesehatan.',
  laporan: 'Rekapitulasi berkala dan pelaporan pimpinan madrasah.',
};

export type ValidModuleAccess = 'view' | 'user' | 'admin';

export const ACCESS_LABELS: Record<ValidModuleAccess, string> = {
  view: 'Lihat',
  user: 'Pengguna',
  admin: 'Administrator',
};

export interface AccessibleModuleItem {
  id: ModuleId;
  name: string;
  description: string;
  access: string;
  rawAccess: ValidModuleAccess;
}

function isValidAccess(access: unknown): access is ValidModuleAccess {
  return access === 'view' || access === 'user' || access === 'admin';
}

export function getAccessibleModules(user: PesmadUser): AccessibleModuleItem[] {
  if (!user || !user.modules) return [];

  return (Object.entries(user.modules) as [ModuleId, string][])
    .filter((entry): entry is [ModuleId, ValidModuleAccess] => isValidAccess(entry[1]))
    .map(([module, access]) => ({
      id: module,
      name: MODULE_LABELS[module] ?? module,
      description: MODULE_DESCRIPTIONS[module] ?? 'Layanan Pesmad terpadu.',
      access: ACCESS_LABELS[access],
      rawAccess: access,
    }));
}

