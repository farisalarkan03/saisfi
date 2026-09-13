'use client';

import React from 'react';
import Link from 'next/link';

interface BuilderTopbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onPreview: () => void;
  onPublish: () => void;
  isSaving: boolean;
  status: 'draft' | 'published';
}

export const BuilderTopbar: React.FC<BuilderTopbarProps> = ({
  title,
  onTitleChange,
  onPreview,
  onPublish,
  isSaving,
  status,
}) => {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand">
            <div className="brand-mark">
              <span className="material-symbols-rounded">draw</span>
            </div>
            <span>Saisfi</span>
          </div>
        </Link>
        <div className="doc-meta">
          <input
            className="doc-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            style={{ width: `${Math.max(160, title.length * 9)}px` }}
            placeholder="Judul Formulir..."
          />
          <span className="autosave">
            <span
              className="material-symbols-rounded"
              style={{ color: isSaving ? 'var(--ink-muted)' : 'var(--success)' }}
            >
              {isSaving ? 'sync' : 'check_circle'}
            </span>
            {isSaving ? 'Menyimpan...' : 'Tersimpan otomatis'}
          </span>
        </div>
      </div>

      <div className="topbar-actions">
        <Link href="/dashboard" className="btn btn-ghost" style={{ padding: '8px 12px' }} title="Kembali ke Dashboard">
          <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>dashboard</span>
          <span>Dashboard</span>
        </Link>
        <button className="icon-btn" title="Undo" onClick={() => {}}>
          <span className="material-symbols-rounded">undo</span>
        </button>
        <button className="icon-btn" title="Redo" onClick={() => {}}>
          <span className="material-symbols-rounded">redo</span>
        </button>
        <button className="btn btn-ghost" onClick={onPreview}>
          <span className="material-symbols-rounded" style={{ fontSize: '17px' }}>visibility</span>
          <span>Pratinjau</span>
        </button>
        <button className="btn btn-primary" onClick={onPublish}>
          <span className="material-symbols-rounded" style={{ fontSize: '17px' }}>bolt</span>
          <span>{status === 'published' ? 'Terbitkan Ulang' : 'Terbitkan'}</span>
        </button>
      </div>

      <style jsx>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
          background: var(--surface);
          border-bottom: 1px solid var(--line);
          height: 68px;
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 19px;
          letter-spacing: -0.01em;
          cursor: pointer;
        }
        .brand-mark {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(155deg, #6C6FFF 0%, #4A46E0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px -3px rgba(91, 95, 239, 0.55);
        }
        .brand-mark .material-symbols-rounded {
          color: #fff;
          font-size: 18px;
        }
        .doc-meta {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-left: 6px;
          padding-left: 18px;
          border-left: 1px solid var(--line);
        }
        .doc-title {
          font-weight: 600;
          font-size: 14.5px;
          color: var(--ink);
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          padding: 6px 6px;
          border-radius: 8px;
          transition: background var(--transition);
        }
        .doc-title:hover, .doc-title:focus {
          background: var(--surface-alt);
        }
        .autosave {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          color: var(--ink-faint);
          white-space: nowrap;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        @media (max-width: 760px) {
          .topbar {
            padding: 0 14px;
            height: 60px;
          }
          .brand span:last-child {
            display: none;
          }
          .doc-meta {
            border-left: none;
            padding-left: 8px;
            margin-left: 4px;
          }
          .autosave {
            display: none;
          }
          .topbar-actions .icon-btn {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
