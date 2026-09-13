'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DataStore } from '@/lib/store';
import { Profile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(DataStore.getCurrentUser());
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    const user = DataStore.getCurrentUser();
    setProfile(user);
    setFullName(user.full_name || '');
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="layout">
      <DashboardHeader />

      <main className="main-content">
        <div className="page-header">
          <h1 className="title">Pengaturan Akun & Langganan</h1>
          <p className="desc">Kelola profil pengguna, status paket Saisfi, dan kunci integrasi Anda.</p>
        </div>

        <div className="settings-grid">
          {/* Profile Card */}
          <div className="card">
            <h3 className="card-title">Profil Pengguna</h3>
            <form onSubmit={handleSave}>
              <div className="avatar-section">
                <img src={profile.avatar_url || ''} alt="Avatar" className="avatar-img" />
                <div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => alert('Fitur upload avatar terhubung ke Supabase Storage Bucket')}>
                    Ganti Foto
                  </button>
                  <p style={{ fontSize: '11.5px', color: 'var(--ink-faint)', marginTop: '4px' }}>
                    JPG, GIF atau PNG. Maks 2MB.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Anda"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Email</label>
                <input
                  className="input"
                  value="faris@saisfi.dev"
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
                Simpan Perubahan
              </button>
              {savedMessage && (
                <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--success)' }}>
                  ✓ Berhasil disimpan
                </span>
              )}
            </form>
          </div>

          {/* Plan & Quota Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Paket Saat Ini</h3>
              <span className="badge badge-pro">PRO UNLIMITED</span>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--ink-muted)', lineHeight: '1.5', marginBottom: '20px' }}>
              Anda menikmati fitur formulir tanpa batas, integrasi otomatis WhatsApp, rate-limit edge Cloudflare, dan ekspor data CSV tak terbatas.
            </p>

            <div className="quota-row">
              <div className="quota-head">
                <span>Formulir Aktif</span>
                <span>Tak Terbatas</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '25%' }} />
              </div>
            </div>

            <div className="quota-row">
              <div className="quota-head">
                <span>Respons per Bulan</span>
                <span>Tak Terbatas</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '15%' }} />
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '14px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                Butuh kuota dedicated enterprise atau custom domain?
              </p>
              <p style={{ fontSize: '11.5px', color: 'var(--ink-faint)', marginTop: '2px' }}>
                Cloudflare Workers & R2 Storage siap dihubungkan langsung ke subdomain Anda.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .layout {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }
        .main-content {
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
          padding: 36px 24px 80px;
        }
        .page-header {
          margin-bottom: 28px;
        }
        .title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .desc {
          font-size: 14px;
          color: var(--ink-muted);
        }
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 24px;
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
        }
        .card-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 18px;
        }
        .avatar-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .avatar-img {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: var(--surface-alt);
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-muted);
          margin-bottom: 6px;
        }
        .input {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: var(--surface-alt);
          font-size: 13.5px;
          color: var(--ink);
          outline: none;
        }
        .input:focus {
          border-color: var(--accent);
          background: var(--surface);
        }
        .quota-row {
          margin-bottom: 16px;
        }
        .quota-head {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .progress-bar {
          height: 7px;
          background: var(--surface-alt);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 999px;
        }
        @media (max-width: 760px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
