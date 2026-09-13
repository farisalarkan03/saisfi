'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DataStore } from '@/lib/store';
import { Profile, Form, PlatformStats } from '@/lib/types';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'forms' | 'logs'>('overview');
  const [stats, setStats] = useState<PlatformStats>({ totalUsers: 0, totalForms: 0, totalResponses: 0, activeToday: 0 });
  const [users, setUsers] = useState<Profile[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [searchForm, setSearchForm] = useState('');
  const [authorized, setAuthorized] = useState<boolean | null>(null); // null = sedang cek

  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; user: string; time: string }>>([
    { id: '1', action: 'Formulir "Pendaftaran Event 2026" diterbitkan ke edge', user: 'Faris Alarkan', time: '10 menit lalu' },
    { id: '2', action: 'Paket pengguna Sarah Amanda diperbarui menjadi Pro', user: 'Administrator', time: '1 jam lalu' },
    { id: '3', action: 'KV Cache rate-limit diperbarui untuk cluster sin1', user: 'Cloudflare Worker', time: '3 jam lalu' },
    { id: '4', action: 'Akun bot spam ditangguhkan otomatis oleh Turnstile', user: 'Sistem Keamanan', time: '5 jam lalu' },
  ]);

  useEffect(() => {
    // ── GUARD: cek role, tolak jika bukan admin ──
    const role = DataStore.getCurrentRole();
    if (role !== 'admin') {
      setAuthorized(false);
      return;
    }
    setAuthorized(true);
    setStats(DataStore.getPlatformStats());
    setUsers(DataStore.getAdminUsers());
    setForms(DataStore.getForms());
  }, []);

  // ── Tampilan 403 jika bukan admin ──
  if (authorized === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span className="material-symbols-rounded" style={{ fontSize: 32, color: 'var(--ink-faint)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'var(--bg)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textAlign: 'center',
        padding: '32px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 36, color: '#E53935' }}>gpp_bad</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Akses Ditolak</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-muted)', maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
          Halaman ini hanya dapat diakses oleh Administrator platform. Anda tidak memiliki izin untuk membuka area ini.
        </p>
        <a href="/dashboard" style={{
          marginTop: 8,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 999,
          background: 'var(--accent)', color: '#fff',
          fontWeight: 700, fontSize: 14, textDecoration: 'none',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
          Kembali ke Dashboard
        </a>
      </div>
    );
  }



  const handleToggleSuspend = (userId: string) => {
    DataStore.toggleUserSuspended(userId);
    setUsers(DataStore.getAdminUsers());
    setAuditLogs((prev) => [
      {
        id: Date.now().toString(),
        action: `Status akun pengguna ${userId} diubah (suspend/aktif)`,
        user: 'Admin Saisfi',
        time: 'Baru saja',
      },
      ...prev,
    ]);
  };

  const handleTogglePlan = (userId: string, currentPlan: 'free' | 'pro') => {
    const nextPlan = currentPlan === 'pro' ? 'free' : 'pro';
    DataStore.updateUserPlan(userId, nextPlan);
    setUsers(DataStore.getAdminUsers());
  };

  const handleDeleteFormModeration = (formId: string, formTitle: string) => {
    if (confirm(`Moderasi Admin: Hapus formulir "${formTitle}" dari platform?`)) {
      DataStore.deleteForm(formId);
      setForms(DataStore.getForms());
      setStats(DataStore.getPlatformStats());
      setAuditLogs((prev) => [
        {
          id: Date.now().toString(),
          action: `Moderasi menghapus formulir "${formTitle}" (ID: ${formId})`,
          user: 'Admin Saisfi',
          time: 'Baru saja',
        },
        ...prev,
      ]);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchUser) return true;
    return (
      (u.full_name || '').toLowerCase().includes(searchUser.toLowerCase()) ||
      u.id.toLowerCase().includes(searchUser.toLowerCase())
    );
  });

  const filteredForms = forms.filter((f) => {
    if (!searchForm) return true;
    return f.title.toLowerCase().includes(searchForm.toLowerCase()) || f.slug.includes(searchForm.toLowerCase());
  });

  return (
    <div className="admin-layout">
      <DashboardHeader />

      <main className="admin-main">
        <div className="admin-banner">
          <div className="banner-left">
            <span className="badge badge-admin">PORTAL KENDALI PLATFORM</span>
            <h1 className="banner-title">Dasbor Administrator Saisfi</h1>
            <p className="banner-desc">
              Pantau seluruh aktivitas formulir, kelola status pengguna, audit log keamanan, dan moderasi konten.
            </p>
          </div>

          <div className="admin-tab-group">
            <button
              className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="material-symbols-rounded">monitoring</span>
              <span>Ringkasan</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="material-symbols-rounded">group</span>
              <span>Pengguna ({users.length})</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'forms' ? 'active' : ''}`}
              onClick={() => setActiveTab('forms')}
            >
              <span className="material-symbols-rounded">fact_check</span>
              <span>Moderasi Form ({forms.length})</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <span className="material-symbols-rounded">receipt_long</span>
              <span>Audit Log</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="tab-content animate-rise">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#ECEDFF', color: '#5B5FEF' }}>
                  <span className="material-symbols-rounded">group</span>
                </div>
                <div className="stat-body">
                  <span className="stat-title">Total Pengguna Terdaftar</span>
                  <div className="stat-row">
                    <span className="stat-number">{stats.totalUsers}</span>
                    <span className="stat-trend positive">+12% minggu ini</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#E7F7EF', color: '#22B07D' }}>
                  <span className="material-symbols-rounded">description</span>
                </div>
                <div className="stat-body">
                  <span className="stat-title">Total Formulir Platform</span>
                  <div className="stat-row">
                    <span className="stat-number">{stats.totalForms}</span>
                    <span className="stat-trend positive">+8 baru</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#FFF3DF', color: '#F5A623' }}>
                  <span className="material-symbols-rounded">mark_email_read</span>
                </div>
                <div className="stat-body">
                  <span className="stat-title">Total Respons Terkumpul</span>
                  <div className="stat-row">
                    <span className="stat-number">{stats.totalResponses}</span>
                    <span className="stat-trend positive">Edge Worker Aktif</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#F6F6FA', color: '#1D1D1F' }}>
                  <span className="material-symbols-rounded">security</span>
                </div>
                <div className="stat-body">
                  <span className="stat-title">Bot Ditahan Turnstile</span>
                  <div className="stat-row">
                    <span className="stat-number">100%</span>
                    <span className="stat-trend neutral">0 insiden</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Overview Table */}
            <div className="card-box" style={{ marginTop: '24px' }}>
              <h3 className="box-title">Aktivitas Audit Terbaru</h3>
              <div className="logs-list">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="log-row">
                    <span className="material-symbols-rounded" style={{ color: 'var(--accent)', fontSize: '18px' }}>
                      history
                    </span>
                    <span className="log-action">{log.action}</span>
                    <span className="log-user">{log.user}</span>
                    <span className="log-time">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="tab-content animate-rise">
            <div className="toolbar-row">
              <div className="search-bar">
                <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--ink-faint)' }}>
                  search
                </span>
                <input
                  placeholder="Cari pengguna berdasarkan nama..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pengguna</th>
                    <th>Peran</th>
                    <th>Paket</th>
                    <th>Status Akun</th>
                    <th style={{ textAlign: 'right' }}>Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={u.avatar_url || ''} alt={u.full_name || ''} className="user-avatar-sm" />
                          <div>
                            <span style={{ fontWeight: 600, display: 'block' }}>{u.full_name}</span>
                            <span style={{ fontSize: '11.5px', color: 'var(--ink-faint)' }}>ID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-draft'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <button
                          className="plan-toggle-btn"
                          onClick={() => handleTogglePlan(u.id, u.plan)}
                          title="Klik untuk ubah paket Free / Pro"
                        >
                          <span className={`badge ${u.plan === 'pro' ? 'badge-pro' : 'badge-draft'}`}>
                            {u.plan.toUpperCase()}
                          </span>
                          <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>swap_vert</span>
                        </button>
                      </td>
                      <td>
                        <span className={`badge ${u.is_suspended ? 'badge-suspended' : 'badge-published'}`}>
                          {u.is_suspended ? 'Ditangguhkan' : 'Aktif'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={`btn btn-sm ${u.is_suspended ? 'btn-primary' : 'btn-danger'}`}
                          onClick={() => handleToggleSuspend(u.id)}
                        >
                          {u.is_suspended ? 'Aktifkan Kembali' : 'Tangguhkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FORMS MODERATION */}
        {activeTab === 'forms' && (
          <div className="tab-content animate-rise">
            <div className="toolbar-row">
              <div className="search-bar">
                <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--ink-faint)' }}>
                  search
                </span>
                <input
                  placeholder="Cari formulir platform..."
                  value={searchForm}
                  onChange={(e) => setSearchForm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Judul Formulir</th>
                    <th>Slug URL</th>
                    <th>Status</th>
                    <th>Kunjungan</th>
                    <th>Pertanyaan</th>
                    <th style={{ textAlign: 'right' }}>Moderasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.map((f) => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.title}</td>
                      <td>
                        <code style={{ fontSize: '12px', background: 'var(--surface-alt)', padding: '2px 6px', borderRadius: '4px' }}>
                          /f/{f.slug}
                        </code>
                      </td>
                      <td>
                        <span className={`badge ${f.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                          {f.status}
                        </span>
                      </td>
                      <td>{f.visit_count || 0}</td>
                      <td>{f.questions?.length || 0} item</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link href={`/f/${f.slug}`} target="_blank" className="btn btn-ghost btn-sm">
                            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>open_in_new</span>
                            <span>Pratinjau</span>
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteFormModeration(f.id, f.title)}
                          >
                            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>delete</span>
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="tab-content animate-rise">
            <div className="card-box">
              <h3 className="box-title">Catatan Audit Keamanan & Sistem</h3>
              <div className="logs-list">
                {auditLogs.map((log) => (
                  <div key={log.id} className="log-row">
                    <span className="material-symbols-rounded" style={{ color: 'var(--accent)', fontSize: '20px' }}>
                      verified
                    </span>
                    <span className="log-action">{log.action}</span>
                    <span className="log-user badge badge-admin">{log.user}</span>
                    <span className="log-time">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }
        .admin-main {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 32px 24px 80px;
        }
        .admin-banner {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 28px 32px;
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
          margin-bottom: 28px;
        }
        .banner-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 26px;
          font-weight: 800;
          margin: 10px 0 6px;
        }
        .banner-desc {
          font-size: 14px;
          color: var(--ink-muted);
          max-width: 650px;
          margin-bottom: 24px;
        }
        .admin-tab-group {
          display: flex;
          gap: 6px;
          border-top: 1px solid var(--line);
          padding-top: 16px;
          flex-wrap: wrap;
        }
        .admin-tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          border: none;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--ink-muted);
          cursor: pointer;
          transition: background var(--transition), color var(--transition);
        }
        .admin-tab-btn:hover {
          background: var(--surface-alt);
          color: var(--ink);
        }
        .admin-tab-btn.active {
          background: var(--accent-soft);
          color: var(--accent-ink);
        }
        .admin-tab-btn .material-symbols-rounded {
          font-size: 18px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .stat-card {
          background: var(--surface);
          border-radius: var(--radius-md);
          padding: 18px 20px;
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .stat-body {
          flex: 1;
        }
        .stat-title {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-muted);
          margin-bottom: 4px;
        }
        .stat-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .stat-number {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px;
          font-weight: 800;
        }
        .stat-trend {
          font-size: 11px;
          font-weight: 700;
        }
        .stat-trend.positive { color: #22B07D; }
        .stat-trend.neutral { color: var(--ink-muted); }
        .card-box {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 24px;
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
        }
        .box-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .log-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          background: var(--surface-alt);
          font-size: 13px;
        }
        .log-action {
          flex: 1;
          font-weight: 500;
        }
        .log-user {
          font-size: 11px;
        }
        .log-time {
          font-size: 11.5px;
          color: var(--ink-faint);
          white-space: nowrap;
        }
        .toolbar-row {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid var(--line);
          width: 300px;
        }
        .search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          width: 100%;
        }
        .table-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13.5px;
        }
        .admin-table th {
          background: var(--surface-alt);
          padding: 12px 18px;
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-muted);
          border-bottom: 1px solid var(--line);
        }
        .admin-table td {
          padding: 14px 18px;
          border-bottom: 1px solid var(--line);
        }
        .admin-table tr:hover td {
          background: #FAFAFD;
        }
        .user-avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: var(--surface-alt);
        }
        .plan-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 6px;
        }
        .plan-toggle-btn:hover {
          background: var(--surface-alt);
        }
        .badge-suspended {
          background: #FFF0F0;
          color: var(--danger);
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
