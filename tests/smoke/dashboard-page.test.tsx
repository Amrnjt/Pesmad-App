import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '../../src/app/dashboard/page';
import * as sessionModule from '../../src/lib/auth/session';
import type { PesmadUser } from '../../src/lib/identity/types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'mock-session-cookie' }),
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn().mockReturnValue({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('Pesmad Dashboard Page', () => {
  it('renders modules according to role permissions for Ustadz', async () => {
    const mockUstadz: PesmadUser = {
      authUid: 'uid-ustadz',
      legacyUserId: 'leg-1',
      username: 'ustadz01',
      usernameNormalized: 'ustadz01',
      nama: 'Ustadz Ahmad',
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

    vi.spyOn(sessionModule, 'readPesmadSession').mockResolvedValue(mockUstadz);

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByRole('heading', { name: /Selamat datang, Ustadz Ahmad/i })).toBeInTheDocument();
    expect(screen.getByText('Peran:')).toBeInTheDocument();

    // Verify modules: Tahfidz and Kinerja are visible with Pengguna access
    expect(screen.getByText('Smart Tahfidz')).toBeInTheDocument();
    expect(screen.getByText('Sistem Kinerja')).toBeInTheDocument();
    expect(screen.getAllByText('Pengguna')).toHaveLength(2);

    // Verify ungranted modules are NOT rendered
    expect(screen.queryByText('Keuangan')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Santri')).not.toBeInTheDocument();
    expect(screen.queryByText('Laporan')).not.toBeInTheDocument();
  });

  it('renders administrator level access for Superadmin', async () => {
    const mockSuperadmin: PesmadUser = {
      authUid: 'uid-admin',
      legacyUserId: 'leg-2',
      username: 'superadmin',
      usernameNormalized: 'superadmin',
      nama: 'Admin Pesmad',
      role: 'Superadmin',
      active: true,
      modules: {
        tahfidz: 'admin',
        kinerja: 'admin',
        keuangan: 'none',
        diniyah: 'none',
        santri: 'none',
        laporan: 'none',
      },
      createdAt: '2026-10-04T00:00:00.000Z',
      updatedAt: '2026-10-04T00:00:00.000Z',
    };

    vi.spyOn(sessionModule, 'readPesmadSession').mockResolvedValue(mockSuperadmin);

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByText(/Superadmin/i)).toBeInTheDocument();
    expect(screen.getAllByText('Administrator')).toHaveLength(2);
  });

  it('renders view level access for Pimpinan', async () => {
    const mockPimpinan: PesmadUser = {
      authUid: 'uid-pimpinan',
      legacyUserId: 'leg-pimpinan',
      username: 'pimpinan01',
      usernameNormalized: 'pimpinan01',
      nama: 'Kiai Ahmad',
      role: 'Pimpinan',
      active: true,
      modules: {
        tahfidz: 'view',
        kinerja: 'view',
        keuangan: 'none',
        diniyah: 'none',
        santri: 'none',
        laporan: 'none',
      },
      createdAt: '2026-10-04T00:00:00.000Z',
      updatedAt: '2026-10-04T00:00:00.000Z',
    };

    vi.spyOn(sessionModule, 'readPesmadSession').mockResolvedValue(mockPimpinan);

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByRole('heading', { name: /Selamat datang, Kiai Ahmad/i })).toBeInTheDocument();
    expect(screen.getByText(/Pimpinan/i)).toBeInTheDocument();
    expect(screen.getByText('Smart Tahfidz')).toBeInTheDocument();
    expect(screen.getByText('Sistem Kinerja')).toBeInTheDocument();
    expect(screen.getAllByText('Lihat')).toHaveLength(2);
  });

  it('shows empty access message when user has no active modules', async () => {
    const emptyUser: PesmadUser = {
      authUid: 'uid-empty',
      legacyUserId: 'leg-3',
      username: 'nouser',
      usernameNormalized: 'nouser',
      nama: 'User Non-Modul',
      role: 'Ustadz',
      active: true,
      modules: {
        tahfidz: 'none',
        kinerja: 'none',
        keuangan: 'none',
        diniyah: 'none',
        santri: 'none',
        laporan: 'none',
      },
      createdAt: '2026-10-04T00:00:00.000Z',
      updatedAt: '2026-10-04T00:00:00.000Z',
    };

    vi.spyOn(sessionModule, 'readPesmadSession').mockResolvedValue(emptyUser);

    const jsx = await DashboardPage();
    render(jsx);

    expect(screen.getByText(/Belum ada akses modul yang diberikan/i)).toBeInTheDocument();
    expect(screen.queryByText('Smart Tahfidz')).not.toBeInTheDocument();
  });
});
