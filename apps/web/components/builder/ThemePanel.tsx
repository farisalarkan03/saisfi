'use client';

import React from 'react';
import { FormTheme, Integration } from '@/lib/types';

interface ThemePanelProps {
  theme: FormTheme;
  onThemeChange: (updated: Partial<FormTheme>) => void;
  integrations: Integration[];
  onToggleIntegration: (type: 'whatsapp' | 'sheets') => void;
}

const COLOR_SWATCHES = [
  { color: '#5B5FEF', ink: '#2F32B8', soft: '#ECEDFF', name: 'Indigo' },
  { color: '#FF7A59', ink: '#D65A3B', soft: '#FFEDE7', name: 'Coral' },
  { color: '#22B07D', ink: '#178A61', soft: '#E3F7EF', name: 'Emerald' },
  { color: '#F5A623', ink: '#C9840F', soft: '#FFF3DF', name: 'Amber' },
  { color: '#EF5DA8', ink: '#C93F87', soft: '#FFE7F3', name: 'Rose' },
  { color: '#1D1D1F', ink: '#000000', soft: '#EDEDED', name: 'Midnight' },
];

export const ThemePanel: React.FC<ThemePanelProps> = ({
  theme,
  onThemeChange,
  integrations,
  onToggleIntegration,
}) => {
  const isWhatsAppEnabled = Boolean(integrations.find((i) => i.type === 'whatsapp')?.enabled);
  const isSheetsEnabled = Boolean(integrations.find((i) => i.type === 'sheets')?.enabled);

  return (
    <aside className="panel panel-right">
      <div className="panel-label">TEMA & TAMPILAN</div>

      <div className="field-group">
        <div className="field-title">Warna aksen</div>
        <div className="swatches">
          {COLOR_SWATCHES.map((sw) => {
            const isSelected = theme.accent_color.toLowerCase() === sw.color.toLowerCase();
            return (
              <div
                key={sw.color}
                className={`swatch ${isSelected ? 'selected' : ''}`}
                style={{
                  background: sw.color,
                  ['--swatch-color' as string]: sw.color,
                }}
                onClick={() =>
                  onThemeChange({
                    accent_color: sw.color,
                    accent_ink: sw.ink,
                    accent_soft: sw.soft,
                  })
                }
                title={sw.name}
              />
            );
          })}
        </div>
      </div>

      <div className="field-group">
        <div className="field-title">Tipe huruf</div>
        <div className="font-pill-row">
          <div
            className={`font-pill ${
              theme.font.includes('Plus Jakarta Sans') ? 'active' : ''
            }`}
            onClick={() => onThemeChange({ font: "'Plus Jakarta Sans', sans-serif" })}
          >
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '13.5px' }}>
              Jakarta Sans
            </span>
            <span className="material-symbols-rounded">check_circle</span>
          </div>

          <div
            className={`font-pill ${theme.font.includes('Inter') ? 'active' : ''}`}
            onClick={() => onThemeChange({ font: "'Inter', sans-serif" })}
          >
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '13.5px' }}>
              Inter Modern
            </span>
            <span className="material-symbols-rounded">check_circle</span>
          </div>
        </div>
      </div>

      <div className="field-group">
        <div className="field-title">Tata letak</div>
        <div className="segmented">
          <div
            className={`seg ${theme.layout === 'one_by_one' ? 'active' : ''}`}
            onClick={() => onThemeChange({ layout: 'one_by_one' })}
          >
            Satu per halaman
          </div>
          <div
            className={`seg ${theme.layout === 'all_at_once' ? 'active' : ''}`}
            onClick={() => onThemeChange({ layout: 'all_at_once' })}
          >
            Semua tampil
          </div>
        </div>
      </div>

      <div className="field-group">
        <div className="field-title">Latar belakang</div>
        <div className="bg-thumbs">
          <div
            className={`bg-thumb bg-plain ${theme.background === 'plain' ? 'active' : ''}`}
            onClick={() => onThemeChange({ background: 'plain' })}
            title="Polos"
          >
            <span className="material-symbols-rounded">
              {theme.background === 'plain' ? 'check' : 'crop_square'}
            </span>
          </div>
          <div
            className={`bg-thumb bg-gradient ${theme.background === 'gradient' ? 'active' : ''}`}
            onClick={() => onThemeChange({ background: 'gradient' })}
            title="Gradien Halus"
          >
            <span className="material-symbols-rounded">
              {theme.background === 'gradient' ? 'check' : 'gradient'}
            </span>
          </div>
          <div
            className={`bg-thumb bg-image ${theme.background === 'image' ? 'active' : ''}`}
            onClick={() => onThemeChange({ background: 'image' })}
            title="Pattern Card"
          >
            <span className="material-symbols-rounded">
              {theme.background === 'image' ? 'check' : 'texture'}
            </span>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="panel-label">INTEGRASI CLOUDFLARE</div>
      <div className="integration-row">
        <div className="integration-icon" style={{ background: '#E7F7EF' }}>
          <span className="material-symbols-rounded" style={{ color: '#22B07D', fontSize: '18px' }}>
            chat
          </span>
        </div>
        <div>
          <div className="integration-name">Notifikasi WhatsApp</div>
          <div className="integration-desc">Kabari tiap ada respons baru</div>
        </div>
        <div
          className={`toggle ${isWhatsAppEnabled ? 'on' : ''}`}
          onClick={() => onToggleIntegration('whatsapp')}
          title="Aktifkan/nonaktifkan integrasi WhatsApp"
        />
      </div>

      <div className="integration-row">
        <div className="integration-icon" style={{ background: '#ECEDFF' }}>
          <span className="material-symbols-rounded" style={{ color: '#5B5FEF', fontSize: '18px' }}>
            table_chart
          </span>
        </div>
        <div>
          <div className="integration-name">Sinkron ke Sheets</div>
          <div className="integration-desc">Ekspor baris otomatis</div>
        </div>
        <div
          className={`toggle ${isSheetsEnabled ? 'on' : ''}`}
          onClick={() => onToggleIntegration('sheets')}
          title="Aktifkan/nonaktifkan integrasi Google Sheets"
        />
      </div>

      <style jsx>{`
        .panel {
          background: var(--surface);
          overflow-y: auto;
          padding: 20px 16px 40px;
          border-left: 1px solid var(--line);
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
        .field-group {
          padding: 6px 8px 18px;
        }
        .field-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-muted);
          margin-bottom: 10px;
        }
        .swatches {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 2px 2px 4px;
        }
        .swatch {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          position: relative;
          transition: transform var(--transition);
        }
        .swatch:hover {
          transform: scale(1.1);
        }
        .swatch.selected {
          border-color: var(--surface);
          box-shadow: 0 0 0 2px var(--swatch-color, var(--accent));
        }
        .swatch.selected::after {
          content: 'check';
          font-family: 'Material Symbols Rounded';
          font-size: 14px;
          color: #fff;
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-variation-settings: 'wght' 600;
        }
        .font-pill-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .font-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--line);
          cursor: pointer;
          transition: border-color var(--transition), background var(--transition);
        }
        .font-pill.active {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .font-pill .material-symbols-rounded {
          color: var(--accent);
          font-size: 18px;
          opacity: 0;
          transition: opacity var(--transition);
        }
        .font-pill.active .material-symbols-rounded {
          opacity: 1;
        }
        .segmented {
          display: flex;
          background: var(--surface-alt);
          border-radius: var(--radius-sm);
          padding: 3px;
          gap: 2px;
        }
        .segmented .seg {
          flex: 1;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-muted);
          padding: 8px 6px;
          border-radius: 8px;
          cursor: pointer;
          transition: background var(--transition), color var(--transition), box-shadow var(--transition);
        }
        .segmented .seg.active {
          background: var(--surface);
          color: var(--ink);
          box-shadow: var(--shadow-soft);
        }
        .bg-thumbs {
          display: flex;
          gap: 10px;
        }
        .bg-thumb {
          flex: 1;
          height: 48px;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--line);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color var(--transition);
        }
        .bg-thumb.active {
          border-color: var(--accent);
        }
        .bg-thumb .material-symbols-rounded {
          color: var(--ink-faint);
          font-size: 18px;
        }
        .bg-thumb.active .material-symbols-rounded {
          color: var(--accent);
        }
        .bg-plain {
          background: #fff;
        }
        .bg-gradient {
          background: linear-gradient(135deg, #8285FF, #4740D6);
        }
        .bg-gradient .material-symbols-rounded {
          color: rgba(255, 255, 255, 0.85) !important;
        }
        .bg-image {
          background: var(--surface-alt);
        }
        .divider {
          height: 1px;
          background: var(--line);
          margin: 16px 4px;
        }
        .integration-row {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 8px;
          border-radius: var(--radius-md);
          transition: background var(--transition);
        }
        .integration-row:hover {
          background: var(--surface-alt);
        }
        .integration-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .integration-name {
          font-size: 13px;
          font-weight: 600;
        }
        .integration-desc {
          font-size: 11.5px;
          color: var(--ink-faint);
        }
        .toggle {
          margin-left: auto;
          width: 36px;
          height: 21px;
          border-radius: 999px;
          background: var(--line);
          position: relative;
          flex: none;
          cursor: pointer;
          transition: background var(--transition);
        }
        .toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          transition: transform var(--transition);
        }
        .toggle.on {
          background: var(--accent);
        }
        .toggle.on::after {
          transform: translateX(15px);
        }
      `}</style>
    </aside>
  );
};
