import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogoutButton } from '../../components/dashboard/LogoutButton';
import { readPesmadSession, sessionCookieName } from '../../lib/auth/session';
import { getAccessibleModules } from '../../lib/identity/modules';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const profile = await readPesmadSession(cookieStore.get(sessionCookieName())?.value);
  if (!profile) redirect('/login?next=%2Fdashboard');

  const modules = getAccessibleModules(profile);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <a className="wordmark" href="/dashboard" aria-label="Pesmad App, beranda">
          Pesmad <span>App</span>
        </a>
        <LogoutButton />
      </header>

      <section className="dashboard-content" aria-labelledby="dashboard-title">
        <div className="dashboard-welcome">
          <p className="eyebrow">Ruang kerja Pesmad</p>
          <h1 id="dashboard-title">Selamat datang, {profile.nama}</h1>
          <div className="role-container">
            <span className="dashboard-role" data-role={profile.role.toLowerCase()}>
              Peran: <strong>{profile.role}</strong>
            </span>
          </div>
        </div>

        <section className="access-panel" aria-labelledby="access-title">
          <div className="section-heading">
            <h2 id="access-title">Akses Anda</h2>
            <p>Modul yang aktif dan tersedia untuk peran akun Anda.</p>
          </div>

          {modules.length > 0 ? (
            <ul className="module-list" aria-label="Daftar modul yang tersedia">
              {modules.map((module) => (
                <li className="module-row" key={module.id}>
                  <div className="module-info">
                    <span className="module-name">{module.name}</span>
                    <span className="module-description">{module.description}</span>
                  </div>
                  <span className={`access-level access-${module.rawAccess}`}>
                    {module.access}
                  </span>
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

