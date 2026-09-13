'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────
   Tipe dialog yang didukung
   ───────────────────────────────────────────── */
export type DialogType = 'prompt' | 'confirm' | 'info';

export interface DialogConfig {
  type: DialogType;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: string;         // material symbol name
  iconColor?: string;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
}

interface AppDialogProps {
  config: DialogConfig | null;
  onClose: () => void;
}

export const AppDialog: React.FC<AppDialogProps> = ({ config, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = !!config;

  useEffect(() => {
    if (config) {
      setInputValue(config.defaultValue || '');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [config]);

  if (!config) return null;

  const handleConfirm = () => {
    config.onConfirm?.(config.type === 'prompt' ? inputValue : undefined);
    onClose();
  };

  const handleCancel = () => {
    config.onCancel?.();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') handleCancel();
  };

  const icon = config.icon || (config.type === 'confirm' ? 'delete' : config.type === 'prompt' ? 'edit_note' : 'info');
  const iconBg = config.iconColor || (config.type === 'confirm' ? '#FEE2E2' : '#ECEDFF');
  const iconFg = config.type === 'confirm' ? '#DC2626' : '#5B5FEF';

  return (
    <>
      {/* Backdrop */}
      <div className="dialog-backdrop" onClick={handleCancel} />

      {/* Dialog */}
      <div className="dialog-box" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
        {/* Icon */}
        <div className="dialog-icon" style={{ background: iconBg }}>
          <span className="material-symbols-rounded" style={{ color: iconFg, fontSize: 22 }}>{icon}</span>
        </div>

        {/* Content */}
        <div className="dialog-content">
          <h3 className="dialog-title">{config.title}</h3>
          {config.message && <p className="dialog-message">{config.message}</p>}

          {config.type === 'prompt' && (
            <input
              ref={inputRef}
              className="dialog-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.placeholder || ''}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            />
          )}
        </div>

        {/* Actions */}
        <div className="dialog-actions">
          {config.type !== 'info' && (
            <button className="btn btn-ghost" onClick={handleCancel}>
              {config.cancelLabel || 'Batal'}
            </button>
          )}
          <button
            className={`btn ${config.type === 'confirm' ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleConfirm}
            autoFocus={config.type !== 'prompt'}
          >
            {config.confirmLabel || (config.type === 'confirm' ? 'Hapus' : 'OK')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .dialog-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 15, 30, 0.45);
          backdrop-filter: blur(6px);
          z-index: 900;
          animation: fadeIn 0.15s ease;
        }
        .dialog-box {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 901;
          background: #fff;
          border-radius: 20px;
          padding: 28px 28px 24px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 60px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: slideUp 0.2s cubic-bezier(.2,.8,.2,1);
        }
        .dialog-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dialog-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dialog-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #1D1D1F;
          line-height: 1.3;
        }
        .dialog-message {
          font-size: 13.5px;
          color: #6E6E73;
          line-height: 1.55;
        }
        .dialog-input {
          margin-top: 4px;
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #E2E2EF;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          color: #1D1D1F;
          background: #F6F6FA;
          outline: none;
          transition: border-color 0.15s;
        }
        .dialog-input:focus {
          border-color: #5B5FEF;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(91,95,239,0.12);
        }
        .dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 4px;
        }
        @keyframes fadeIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) }
          to   { opacity: 1; transform: translate(-50%, -50%) }
        }
      `}</style>
    </>
  );
};

/* ─────────────────────────────────────────────
   Hook helper: useDialog
   ───────────────────────────────────────────── */
export function useDialog() {
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  const showPrompt = (config: Omit<DialogConfig, 'type'>): Promise<string | null> =>
    new Promise((resolve) => {
      setDialog({
        ...config,
        type: 'prompt',
        onConfirm: (val) => resolve(val ?? ''),
        onCancel: () => resolve(null),
      });
    });

  const showConfirm = (config: Omit<DialogConfig, 'type'>): Promise<boolean> =>
    new Promise((resolve) => {
      setDialog({
        ...config,
        type: 'confirm',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

  const showInfo = (config: Omit<DialogConfig, 'type'>) => {
    setDialog({ ...config, type: 'info', onConfirm: () => {} });
  };

  const closeDialog = () => setDialog(null);

  return { dialog, closeDialog, showPrompt, showConfirm, showInfo };
}
