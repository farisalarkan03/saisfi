'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="landing">
      {/* Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-mark">
            <span className="material-symbols-rounded">draw</span>
          </div>
          <span>Saisfi</span>
        </div>
        <div className="nav-actions">
          <Link href="/f/pendaftaran-event" className="btn btn-ghost">
            <span className="material-symbols-rounded">visibility</span>
            <span>Contoh Publik</span>
          </Link>
          <Link href="/dashboard" className="btn btn-primary">
            <span>Buka Dashboard</span>
            <span className="material-symbols-rounded">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <div className="badge-pill">
          <span className="sparkle">✨</span>
          <span>Didukung Arsitektur Supabase + Cloudflare Edge</span>
        </div>

        <h1 className="hero-title">
          Platform Form Builder Modern <br />
          <span className="gradient-text">Cepat, Elegan, dan Terproteksi.</span>
        </h1>

        <p className="hero-desc">
          Rancang formulir interaktif dengan pengalaman visual berkelas dunia.
          Dilengkapi proteksi bot Cloudflare Turnstile, rate-limit KV, integrasi WhatsApp,
          dan database Supabase Postgres.
        </p>

        <div className="cta-group">
          <Link href="/builder" className="btn btn-primary cta-btn">
            <span className="material-symbols-rounded">add_circle</span>
            <span>Mulai Buat Formulir</span>
          </Link>
          <Link href="/admin" className="btn btn-ghost cta-btn">
            <span className="material-symbols-rounded">admin_panel_settings</span>
            <span>Eksplor Portal Admin</span>
          </Link>
        </div>

        {/* Interactive Feature Cards */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feat-icon" style={{ background: '#ECEDFF', color: '#5B5FEF' }}>
              <span className="material-symbols-rounded">palette</span>
            </div>
            <h3>Tema & Tipografi Dinamis</h3>
            <p>Kustomisasi instan warna aksen, font Jakarta Sans / Inter, dan layout satu per halaman langsung di browser.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon" style={{ background: '#E7F7EF', color: '#22B07D' }}>
              <span className="material-symbols-rounded">bolt</span>
            </div>
            <h3>Cloudflare Edge Processing</h3>
            <p>Validasi submission anti-spam, KV rate limiting, dan dispatch ke WhatsApp & Google Sheets tanpa membebani server.</p>
          </div>

          <div className="feature-card">
            <div className="feat-icon" style={{ background: '#FFF3DF', color: '#C9840F' }}>
              <span className="material-symbols-rounded">database</span>
            </div>
            <h3>Supabase Postgres & RLS</h3>
            <p>Keamanan tingkat baris (Row Level Security), penyimpanan berkas aman, serta pemisahan hak akses Pengguna dan Admin.</p>
          </div>
        </div>

        {/* Live Preview Teaser */}
        <div className="preview-container">
          <div className="preview-top">
            <div className="dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <span className="preview-url">saisfi.dev/builder/pendaftaran-event</span>
            <div style={{ width: '48px' }} />
          </div>
          <div className="preview-content">
            <div className="preview-card-mock">
              <div className="mock-cover" />
              <h2 className="mock-title">Formulir Pendaftaran Event 2026</h2>
              <p className="mock-sub">Dapatkan tiket workshop dan materi eksklusif sekarang.</p>
              <div className="mock-input" />
              <div className="mock-input" />
              <div className="mock-btn">Kirim Jawaban</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Saisfi Platform — Dibangun dengan Next.js, Supabase, dan Cloudflare Pages.</p>
      </footer>

      <style jsx>{`
        .landing {
          min-height: 100vh;
          background: linear-gradient(180deg, #FFFFFF 0%, var(--bg) 600px);
          display: flex;
          flex-direction: column;
        }
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 48px;
          border-bottom: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 21px;
          color: var(--ink);
        }
        .brand-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(155deg, #6C6FFF 0%, #4A46E0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px -3px rgba(91, 95, 239, 0.55);
        }
        .brand-mark .material-symbols-rounded {
          color: #fff;
          font-size: 19px;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hero {
          max-width: 1080px;
          margin: 0 auto;
          padding: 60px 24px 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink-muted);
          box-shadow: var(--shadow-soft);
          margin-bottom: 24px;
        }
        .hero-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 48px;
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 20px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #5B5FEF 0%, #3B36B2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-desc {
          max-width: 680px;
          font-size: 17px;
          line-height: 1.6;
          color: var(--ink-muted);
          margin-bottom: 36px;
        }
        .cta-group {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 60px;
        }
        .cta-btn {
          padding: 13px 26px;
          font-size: 15px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
          margin-bottom: 64px;
          text-align: left;
        }
        .feature-card {
          background: var(--surface);
          padding: 26px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
          transition: transform var(--transition);
        }
        .feature-card:hover {
          transform: translateY(-4px);
        }
        .feat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .feature-card h3 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .feature-card p {
          font-size: 13.5px;
          color: var(--ink-muted);
          line-height: 1.5;
        }
        .preview-container {
          width: 100%;
          max-width: 760px;
          background: var(--surface);
          border-radius: var(--radius-xl);
          border: 1px solid var(--line);
          box-shadow: var(--shadow-ambient);
          overflow: hidden;
        }
        .preview-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: var(--surface-alt);
          border-bottom: 1px solid var(--line);
        }
        .dots {
          display: flex;
          gap: 6px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot.red { background: #FF5F56; }
        .dot.yellow { background: #FFBD2E; }
        .dot.green { background: #27C93F; }
        .preview-url {
          font-size: 12px;
          color: var(--ink-muted);
          font-family: monospace;
        }
        .preview-content {
          padding: 32px;
          display: flex;
          justify-content: center;
          background: #FAFAFD;
        }
        .preview-card-mock {
          max-width: 480px;
          width: 100%;
          background: #fff;
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-soft);
          border: 1px solid var(--line);
          text-align: left;
        }
        .mock-cover {
          height: 80px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #8285FF 0%, #5B5FEF 100%);
          margin-bottom: 18px;
        }
        .mock-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .mock-sub {
          font-size: 13px;
          color: var(--ink-muted);
          margin-bottom: 18px;
        }
        .mock-input {
          height: 38px;
          background: var(--surface-alt);
          border-radius: var(--radius-sm);
          margin-bottom: 10px;
          border: 1px solid var(--line);
        }
        .mock-btn {
          margin-top: 14px;
          background: #5B5FEF;
          color: #fff;
          padding: 10px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
        }
        .footer {
          margin-top: auto;
          padding: 24px;
          border-top: 1px solid var(--line);
          background: var(--surface);
          text-align: center;
          font-size: 13px;
          color: var(--ink-muted);
        }
        @media (max-width: 860px) {
          .hero-title { font-size: 34px; }
          .features-grid { grid-template-columns: 1fr; }
          .navbar { padding: 14px 20px; }
        }
      `}</style>
    </div>
  );
}
