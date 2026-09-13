'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DataStore } from '@/lib/store';
import { Form, FormResponse } from '@/lib/types';

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formIdOrSlug = params?.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!formIdOrSlug) return;
    let found = DataStore.getFormById(formIdOrSlug);
    if (!found) {
      found = DataStore.getFormBySlug(formIdOrSlug);
    }
    if (found) {
      setForm(found);
      setResponses(DataStore.getResponses(found.id));
    }
  }, [formIdOrSlug]);

  // Export to CSV functionality
  const exportToCSV = () => {
    if (!form || responses.length === 0) {
      return;
    }

    const questions = form.questions || [];
    const headers = ['ID Respons', 'Waktu Masuk', 'User Agent', ...questions.map((q) => `"${q.label.replace(/"/g, '""')}"`)];

    const rows = responses.map((r) => {
      const answersMap = new Map(r.answers?.map((a) => [a.question_id, a.value]) || []);
      const answerCols = questions.map((q) => {
        const val = answersMap.get(q.id);
        if (val === undefined || val === null) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [
        r.id,
        new Date(r.submitted_at).toLocaleString('id-ID'),
        `"${r.meta?.user_agent || ''}"`,
        ...answerCols,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `respons_${form.slug}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!form) {
    return (
      <div className="layout">
        <DashboardHeader />
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-muted)' }}>
          Memuat respons formulir...
        </div>
      </div>
    );
  }

  const questions = form.questions || [];

  const filteredResponses = responses.filter((r) => {
    if (!search) return true;
    const matchMeta = JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
    return matchMeta;
  });

  return (
    <div className="layout">
      <DashboardHeader />

      <main className="main-content">
        <div className="top-nav-bar">
          <Link href="/dashboard" className="back-link">
            <span className="material-symbols-rounded">arrow_back</span>
            <span>Kembali ke Formulir Saya</span>
          </Link>
          <div className="top-right-actions">
            <Link href={`/builder/${form.id}`} className="btn btn-ghost btn-sm">
              <span className="material-symbols-rounded">edit</span>
              <span>Edit di Builder</span>
            </Link>
            <Link href={`/f/${form.slug}`} target="_blank" className="btn btn-ghost btn-sm">
              <span className="material-symbols-rounded">open_in_new</span>
              <span>Buka Formulir Publik</span>
            </Link>
            <button className="btn btn-primary btn-sm" onClick={exportToCSV}>
              <span className="material-symbols-rounded">download</span>
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        <div className="header-box">
          <h1 className="form-title">Respons: {form.title}</h1>
          <p className="form-sub">
            Total {responses.length} respons terkumpul • Terakhir diperbarui {new Date(form.updated_at).toLocaleDateString('id-ID')}
          </p>
        </div>

        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="search-bar">
            <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--ink-faint)' }}>
              search
            </span>
            <input
              placeholder="Cari respons atau responden..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <span style={{ fontSize: '13px', color: 'var(--ink-muted)', marginLeft: 'auto' }}>
            Menampilkan {filteredResponses.length} dari {responses.length} respons
          </span>
        </div>

        {/* Data Table */}
        {responses.length === 0 ? (
          <div className="empty-box">
            <span className="material-symbols-rounded" style={{ fontSize: '48px', color: 'var(--ink-faint)' }}>
              inbox
            </span>
            <h3>Belum Ada Respons Masuk</h3>
            <p>Bagikan tautan formulir Anda untuk mulai mengumpulkan data dari responden.</p>
            <Link href={`/f/${form.slug}`} target="_blank" className="btn btn-primary" style={{ marginTop: '16px' }}>
              <span className="material-symbols-rounded">send</span>
              <span>Uji Coba Pengisian Form</span>
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="resp-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>#</th>
                  <th style={{ width: '170px' }}>Waktu Submit</th>
                  {questions.slice(0, 4).map((q) => (
                    <th key={q.id}>{q.label}</th>
                  ))}
                  {questions.length > 4 && <th>Lainnya</th>}
                  <th style={{ width: '90px', textAlign: 'center' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((r, idx) => {
                  const answersMap = new Map(r.answers?.map((a) => [a.question_id, a.value]) || []);

                  return (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--ink-faint)', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--ink-muted)' }}>
                        {new Date(r.submitted_at).toLocaleString('id-ID')}
                      </td>
                      {questions.slice(0, 4).map((q) => {
                        const val = answersMap.get(q.id);
                        return (
                          <td key={q.id} className="answer-cell">
                            {val !== undefined && val !== null ? String(val) : '—'}
                          </td>
                        );
                      })}
                      {questions.length > 4 && (
                        <td style={{ color: 'var(--ink-faint)', fontSize: '12px' }}>
                          +{questions.length - 4} kolom
                        </td>
                      )}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 10px' }}
                          onClick={() => setSelectedResponse(r)}
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedResponse && (
        <div className="modal-backdrop" onClick={() => setSelectedResponse(null)}>
          <div className="modal-card animate-rise" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>Detail Jawaban Respons</h2>
                <p style={{ fontSize: '12.5px', color: 'var(--ink-muted)' }}>
                  Diserahkan pada {new Date(selectedResponse.submitted_at).toLocaleString('id-ID')}
                </p>
              </div>
              <button className="icon-btn" onClick={() => setSelectedResponse(null)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="answers-list">
              {questions.map((q) => {
                const answer = selectedResponse.answers?.find((a) => a.question_id === q.id);
                return (
                  <div key={q.id} className="detail-item">
                    <p className="detail-label">{q.label}</p>
                    <p className="detail-value">
                      {answer?.value !== undefined && answer?.value !== null
                        ? String(answer.value)
                        : '(Tidak diisi)'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .layout {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 32px 24px 80px;
        }
        .top-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--ink-muted);
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
        }
        .back-link:hover {
          color: var(--ink);
        }
        .top-right-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .header-box {
          margin-bottom: 24px;
        }
        .form-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .form-sub {
          font-size: 13.5px;
          color: var(--ink-muted);
        }
        .table-toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
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
          width: 280px;
        }
        .search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          width: 100%;
        }
        .table-container {
          background: var(--surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
          overflow-x: auto;
        }
        .resp-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13.5px;
        }
        .resp-table th {
          background: var(--surface-alt);
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-muted);
          border-bottom: 1px solid var(--line);
          white-space: nowrap;
        }
        .resp-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--line);
          color: var(--ink);
        }
        .resp-table tr:hover td {
          background: #FAFAFD;
        }
        .answer-cell {
          max-width: 240px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .empty-box {
          background: var(--surface);
          border-radius: var(--radius-xl);
          border: 1px dashed var(--line);
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-box h3 {
          margin: 12px 0 6px;
          font-size: 18px;
        }
        .empty-box p {
          color: var(--ink-muted);
          font-size: 14px;
        }
        .btn-sm {
          padding: 7px 14px;
          font-size: 12.5px;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(29, 29, 31, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }
        .modal-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          max-width: 540px;
          width: 100%;
          box-shadow: var(--shadow-ambient);
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        .modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--line);
        }
        .modal-head h2 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .answers-list {
          overflow-y: auto;
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .detail-item {
          background: var(--surface-alt);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
        }
        .detail-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-muted);
          margin-bottom: 4px;
        }
        .detail-value {
          font-size: 14px;
          color: var(--ink);
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}
