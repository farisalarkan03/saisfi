'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DataStore } from '@/lib/store';
import { Form } from '@/lib/types';
import { ShareModal } from '@/components/builder/ShareModal';
import { AppDialog, useDialog } from '@/components/ui/AppDialog';

export default function DashboardPage() {
  const router = useRouter();
  const { dialog, closeDialog, showConfirm } = useDialog();
  const [forms, setForms] = useState<Form[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalData, setShareModalData] = useState<{ isOpen: boolean; slug: string; title: string }>({
    isOpen: false,
    slug: '',
    title: '',
  });

  useEffect(() => {
    setForms(DataStore.getForms());
  }, []);

  const handleCreateForm = () => {
    // Langsung buat form baru dan arahkan ke builder tanpa modal/prompt
    const newForm = DataStore.createForm('Formulir Baru');
    router.push(`/builder/default?id=${newForm.id}`);
  };

  const handleDeleteForm = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await showConfirm({
      title: 'Hapus Formulir?',
      message: `Formulir "${title}" akan dihapus permanen dan tidak bisa dikembalikan.`,
      icon: 'delete_forever',
      confirmLabel: 'Hapus Permanen',
      cancelLabel: 'Batal',
    });
    if (ok) {
      DataStore.deleteForm(id);
      setForms(DataStore.getForms());
    }
  };

  const filteredForms = forms.filter((f) => {
    if (filter !== 'all' && f.status !== filter) return false;
    if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPublished = forms.filter((f) => f.status === 'published').length;
  const totalResponsesCount = forms.reduce((acc, f) => acc + DataStore.getResponses(f.id).length, 0);

  return (
    <div className="dash-layout">
      <AppDialog config={dialog} onClose={closeDialog} />
      <DashboardHeader />

      <main className="dash-main">
        {/* Metric Cards Header */}
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#ECEDFF', color: '#5B5FEF' }}>
              <span className="material-symbols-rounded">description</span>
            </div>
            <div>
              <p className="metric-label">Total Formulir</p>
              <h3 className="metric-val">{forms.length}</h3>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#E7F7EF', color: '#22B07D' }}>
              <span className="material-symbols-rounded">check_circle</span>
            </div>
            <div>
              <p className="metric-label">Formulir Terbit</p>
              <h3 className="metric-val">{totalPublished}</h3>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#FFF3DF', color: '#F5A623' }}>
              <span className="material-symbols-rounded">forum</span>
            </div>
            <div>
              <p className="metric-label">Total Respons Masuk</p>
              <h3 className="metric-val">{totalResponsesCount}</h3>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#F6F6FA', color: '#1D1D1F' }}>
              <span className="material-symbols-rounded">bolt</span>
            </div>
            <div>
              <p className="metric-label">Kecepatan Edge</p>
              <h3 className="metric-val">&lt; 35 ms</h3>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="section-head">
          <div>
            <h1 className="section-title">Formulir Saya</h1>
            <p className="section-desc">Kelola dan pantau kinerja formulir online Anda.</p>
          </div>

          <div className="action-row">
            <div className="search-box">
              <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--ink-faint)' }}>
                search
              </span>
              <input
                className="search-input"
                placeholder="Cari formulir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-pill-group">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Semua ({forms.length})
              </button>
              <button
                className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
                onClick={() => setFilter('published')}
              >
                Terbit ({totalPublished})
              </button>
              <button
                className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
                onClick={() => setFilter('draft')}
              >
                Draft ({forms.length - totalPublished})
              </button>
            </div>

            <button className="btn btn-primary" onClick={handleCreateForm}>
              <span className="material-symbols-rounded">add</span>
              <span>Buat Formulir Baru</span>
            </button>
          </div>
        </div>

        {/* Form Cards Grid */}
        {filteredForms.length === 0 ? (
          <div className="empty-card">
            <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--ink-faint)' }}>
              inbox
            </span>
            <h3>Belum ada formulir</h3>
            <p>Mulai rancang formulir pertama Anda untuk mengumpulkan jawaban responden.</p>
            <button className="btn btn-primary" onClick={handleCreateForm} style={{ marginTop: '14px' }}>
              <span className="material-symbols-rounded">add</span>
              <span>Buat Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="forms-grid">
            {filteredForms.map((form) => {
              const responses = DataStore.getResponses(form.id);
              const isPub = form.status === 'published';

              return (
                <div key={form.id} className="form-card">
                  <div
                    className="card-cover-mini"
                    style={{
                      background:
                        form.theme.cover_gradient ||
                        `linear-gradient(135deg, ${form.theme.accent_color}CC 0%, ${form.theme.accent_color} 100%)`,
                    }}
                  >
                    <span className={`badge ${isPub ? 'badge-published' : 'badge-draft'}`}>
                      <span className="material-symbols-rounded" style={{ fontSize: '13px' }}>
                        {isPub ? 'check_circle' : 'edit_note'}
                      </span>
                      {isPub ? 'Terbit' : 'Draft'}
                    </span>
                  </div>

                  <div className="card-body">
                    <Link href={`/builder/default?id=${form.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="card-title" title={form.title} style={{ cursor: 'pointer' }}>
                        {form.title}
                      </h3>
                    </Link>
                    <p className="card-desc">
                      {form.description || 'Tidak ada deskripsi'}
                    </p>

                    <div className="card-meta-row">
                      <span className="meta-item">
                        <span className="material-symbols-rounded">quiz</span>
                        <span>{form.questions?.length || 0} Pertanyaan</span>
                      </span>
                      <span className="meta-item">
                        <span className="material-symbols-rounded">forum</span>
                        <span>{responses.length} Respons</span>
                      </span>
                    </div>

                    <div className="card-actions">
                      <Link href={`/builder/default?id=${form.id}`} className="btn btn-primary btn-sm">
                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>edit</span>
                        <span>Buka Builder</span>
                      </Link>

                      <Link
                        href={`/dashboard/forms/default/responses?id=${form.id}`}
                        className="btn btn-ghost btn-sm"
                        title="Lihat Jawaban"
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>table_chart</span>
                        <span>Respons ({responses.length})</span>
                      </Link>

                      <a
                        href={`/f?slug=${encodeURIComponent(form.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-btn"
                        title="Lihat / Pratinjau Formulir"
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>visibility</span>
                      </a>

                      {isPub && (
                        <button
                          className="icon-btn"
                          title="Bagikan link publik"
                          onClick={() => setShareModalData({ isOpen: true, slug: form.slug, title: form.title })}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>share</span>
                        </button>
                      )}

                      <button
                        className="icon-btn"
                        title="Hapus formulir"
                        onClick={(e) => handleDeleteForm(form.id, form.title, e)}
                        style={{ marginLeft: 'auto' }}
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--danger)' }}>
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ShareModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData((prev) => ({ ...prev, isOpen: false }))}
        slug={shareModalData.slug}
        title={shareModalData.title}
      />

      <style jsx>{`
        .dash-layout {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }
        .dash-main {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 36px 24px 80px;
        }
        .metrics-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 36px;
        }
        .metric-card {
          background: var(--surface);
          border-radius: var(--radius-md);
          padding: 18px 20px;
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .metric-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .metric-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-muted);
          margin-bottom: 3px;
        }
        .metric-val {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--ink);
        }
        .section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .section-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.015em;
          margin-bottom: 4px;
        }
        .section-desc {
          font-size: 14px;
          color: var(--ink-muted);
        }
        .action-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid var(--line);
          width: 220px;
        }
        .search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          color: var(--ink);
          width: 100%;
        }
        .filter-pill-group {
          display: flex;
          background: var(--surface-alt);
          padding: 3px;
          border-radius: 999px;
          gap: 2px;
        }
        .filter-btn {
          border: none;
          background: transparent;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-muted);
          cursor: pointer;
          transition: background var(--transition), color var(--transition);
        }
        .filter-btn.active {
          background: var(--surface);
          color: var(--ink);
          box-shadow: var(--shadow-soft);
        }
        .forms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .form-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .form-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-ambient);
        }
        .card-cover-mini {
          height: 64px;
          padding: 12px;
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          position: relative;
        }
        .card-body {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16.5px;
          font-weight: 700;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-desc {
          font-size: 13px;
          color: var(--ink-muted);
          line-height: 1.45;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 38px;
        }
        .card-meta-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          margin-bottom: 16px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--ink-muted);
          font-weight: 500;
        }
        .meta-item .material-symbols-rounded {
          font-size: 16px;
        }
        .card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
        }
        .btn-sm {
          padding: 7px 12px;
          font-size: 12.5px;
        }
        .empty-card {
          background: var(--surface);
          border: 1px dashed var(--line);
          border-radius: var(--radius-xl);
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-card h3 {
          font-size: 18px;
          margin: 12px 0 6px;
        }
        .empty-card p {
          color: var(--ink-muted);
          font-size: 14px;
        }
        @media (max-width: 900px) {
          .metrics-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .metrics-row {
            grid-template-columns: 1fr;
          }
          .search-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
