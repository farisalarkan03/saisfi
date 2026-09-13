'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  title: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  slug,
  title,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/f/${slug}`
    : `/f/${slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-rise" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="badge-icon">
            <span className="material-symbols-rounded" style={{ color: '#22B07D', fontSize: '24px' }}>
              check_circle
            </span>
          </div>
          <div>
            <h2 className="modal-title">Formulir Berhasil Diterbitkan!</h2>
            <p className="modal-desc">
              Responden dapat langsung mengisi formulir Anda melalui link publik berkecepatan tinggi di bawah ini.
            </p>
          </div>
          <button className="icon-btn close-btn" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="link-box">
          <input className="link-input" value={publicUrl} readOnly />
          <button className="btn btn-primary" onClick={copyToClipboard}>
            <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
              {copied ? 'done' : 'content_copy'}
            </span>
            <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
          </button>
        </div>

        <div className="modal-actions">
          <Link
            href={`/f/${slug}`}
            target="_blank"
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span className="material-symbols-rounded">open_in_new</span>
            <span>Buka Formulir Publik</span>
          </Link>
          <Link
            href={`/dashboard/forms/${slug}/responses`}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onClose}
          >
            <span className="material-symbols-rounded">table_chart</span>
            <span>Lihat Kotak Masuk Respons</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(29, 29, 31, 0.45);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }
        .modal-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 28px;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 20px 40px -15px rgba(29, 29, 31, 0.25);
          border: 1px solid var(--line);
        }
        .modal-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
          position: relative;
        }
        .badge-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #E7F7EF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .modal-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .modal-desc {
          font-size: 13px;
          color: var(--ink-muted);
          line-height: 1.45;
        }
        .close-btn {
          position: absolute;
          top: -6px;
          right: -6px;
        }
        .link-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface-alt);
          padding: 6px 6px 6px 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--line);
          margin-bottom: 20px;
        }
        .link-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--ink);
          font-family: monospace;
        }
        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};
