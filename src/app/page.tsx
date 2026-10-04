import Link from 'next/link';

export default function Page() {
  return (
    <main className="landing-shell">
      <section className="landing-card" aria-labelledby="pesmad-app-title">
        <p className="eyebrow">Pusat Sistem Informasi Pesantren</p>
        <h1 id="pesmad-app-title">PESMAD APP</h1>
        <p className="lead">
          Portal internal Pesmad untuk mengakses Smart Tahfidz, Sistem Kinerja,
          dan layanan digital pesantren dalam satu pusat kendali.
        </p>
        <Link className="primary-link" href="/login">
          Masuk ke Pesmad App
        </Link>
      </section>
    </main>
  );
}
