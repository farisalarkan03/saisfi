'use client';

import React from 'react';
import { QuestionType } from '@/lib/types';

interface BlockPaletteProps {
  onAddQuestion: (type: QuestionType) => void;
  activeType?: QuestionType;
}

const QUESTION_BLOCKS: Array<{ type: QuestionType; name: string; icon: string }> = [
  { type: 'short_text', name: 'Teks singkat', icon: 'short_text' },
  { type: 'paragraph', name: 'Paragraf', icon: 'notes' },
  { type: 'multiple_choice', name: 'Pilihan ganda', icon: 'radio_button_checked' },
  { type: 'checkbox', name: 'Kotak centang', icon: 'check_box' },
  { type: 'dropdown', name: 'Dropdown', icon: 'arrow_drop_down_circle' },
  { type: 'date', name: 'Tanggal', icon: 'calendar_month' },
  { type: 'number', name: 'Angka', icon: 'tag' },
  { type: 'rating', name: 'Skala rating', icon: 'star' },
  { type: 'file', name: 'Unggah file', icon: 'upload_file' },
];

export const BlockPalette: React.FC<BlockPaletteProps> = ({
  onAddQuestion,
  activeType,
}) => {
  return (
    <aside className="panel panel-left">
      <div className="panel-label">TAMBAH BLOK</div>
      <div className="block-list">
        {QUESTION_BLOCKS.map((block) => {
          const isActive = activeType === block.type;
          return (
            <div
              key={block.type}
              className={`block-item ${isActive ? 'active' : ''}`}
              onClick={() => onAddQuestion(block.type)}
              title={`Klik untuk menambahkan ${block.name}`}
            >
              <div className="block-icon">
                <span className="material-symbols-rounded">{block.icon}</span>
              </div>
              <span className="block-name">{block.name}</span>
              <span
                className="material-symbols-rounded add-icon"
                style={{ marginLeft: 'auto', fontSize: '16px', opacity: 0.4 }}
              >
                add
              </span>
            </div>
          );
        })}
      </div>

      <div className="divider" />

      <div className="panel-label">STRUKTUR</div>
      <div className="block-list">
        <div
          className="block-item block-item--disabled"
          title="Fitur Multi-halaman: diatur di Pengaturan Tata Letak (segera hadir)"
        >
          <div className="block-icon">
            <span className="material-symbols-rounded">splitscreen</span>
          </div>
          <span className="block-name">Pemisah Halaman</span>
        </div>
        <div
          className="block-item block-item--disabled"
          title="Logika Cabang: tersedia pada paket Pro (segera hadir)"
        >
          <div className="block-icon">
            <span className="material-symbols-rounded">call_split</span>
          </div>
          <span className="block-name">Logika Cabang</span>
        </div>
      </div>

      <style jsx>{`
        .panel {
          background: var(--surface);
          overflow-y: auto;
          padding: 20px 16px 40px;
          border-right: 1px solid var(--line);
          height: calc(100vh - 68px);
        }
        .panel::-webkit-scrollbar {
          width: 0;
        }
        .panel-label {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--ink-muted);
          padding: 4px 8px 12px;
          letter-spacing: 0.05em;
        }
        .block-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .block-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          border: 1px solid transparent;
          transition: background var(--transition), border-color var(--transition), transform var(--transition);
          user-select: none;
        }
        .block-item:hover {
          background: var(--surface-alt);
          transform: translateX(2px);
        }
        .block-item.active {
          background: var(--accent-soft);
          border-color: var(--accent-soft-2);
        }
        .block-item.active .block-icon {
          background: var(--accent);
          color: #fff;
        }
        .block-item--disabled {
          opacity: 0.45;
          cursor: not-allowed;
          pointer-events: none;
        }
        .block-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: var(--surface-alt);
          color: var(--ink-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          transition: background var(--transition), color var(--transition);
        }
        .block-name {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink);
        }
        .divider {
          height: 1px;
          background: var(--line);
          margin: 16px 4px;
        }
      `}</style>
    </aside>
  );
};
