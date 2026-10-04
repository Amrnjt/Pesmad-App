import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { readPesmadSession, sessionCookieName } from '@/lib/auth/session';
import type { ModuleId, PesmadUser } from '@/lib/identity/types';

const moduleLabels: Record<ModuleId, string> = {
  tahfidz: 'Smart Tahfidz',
  kinerja: 'Sistem Kinerja',
  keuangan: 'Keuangan',
  diniyah: 'Diniyah',
  santri: 'Data Santri',
  laporan: 'Laporan',
};

const accessLabels: Record<string, string> = {
  view: 'Lihat',
  user: 'Pengguna',
  admin: 'Administrator',
};

function accessibleModules(user: PesmadUser) {
  return (Object.entries(user.modules) as [ModuleId, string][])
    .filter(([, access]) => access !== 'none')
    .map(([module, access]) => ({
      name: moduleLabels[module],
      access: accessLabels[access] ?? 'Akses tersedia',
    }));
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const profile = await readPesmadSession(cookieStore.get(sessionCookieName())?.value);
  if (!profile) redirect('/login?next=%2Fdashboard');

  const modules = accessibleModules(profile);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <a className="wordmark" href="/dashboard" aria-label="Pesmad App, beranda">
          Pesmad <span>App</span>
        </a>
        <LogoutButton />
      </header>

      <section className="dashboard-content" aria-labelledby="dashboard-title">
        <p className="eyebrow">Ruang kerja Pesmad</p>
        <h1 id="dashboard-title">Selamat datang, {profile.nama}</h1>
        <p className="dashboard-role">{profile.role}</p>

        <section className="access-panel" aria-labelledby="access-title">
          <div className="section-heading">
            <h2 id="access-title">Akses Anda</h2>
            <p>Modul yang tercatat untuk akun ini.</p>
          </div>

          {modules.length > 0 ? (
            <ul className="module-list">
              {modules.map((module) => (
                <li className="module-row" key={module.name}>
                  <span>{module.name}</span>
                  <span className="access-level">{module.access}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-access">
              Belum ada akses modul yang diberikan. Hubungi administrator Pesmad untuk meminta akses.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
