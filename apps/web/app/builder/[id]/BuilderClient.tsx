'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DataStore } from '@/lib/store';
import { Form, QuestionType, FormTheme } from '@/lib/types';
import { BuilderTopbar } from '@/components/builder/BuilderTopbar';
import { BlockPalette } from '@/components/builder/BlockPalette';
import { FormCanvas } from '@/components/builder/FormCanvas';
import { ThemePanel } from '@/components/builder/ThemePanel';
import { BuilderMobileNav, ActiveMobileTab } from '@/components/builder/BuilderMobileNav';
import { ShareModal } from '@/components/builder/ShareModal';

export default function BuilderClient() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<ActiveMobileTab>('canvas');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [integrations, setIntegrations] = useState(form ? DataStore.getIntegrations(form.id) : []);

  // Load form from store
  useEffect(() => {
    if (!formId) return;
    let loaded = DataStore.getFormById(formId);
    if (!loaded) {
      const forms = DataStore.getForms();
      loaded = forms[0] || DataStore.createForm();
    }
    setForm(loaded);
    setIntegrations(DataStore.getIntegrations(loaded.id));
  }, [formId]);

  // Apply theme tokens to root dynamically
  useEffect(() => {
    if (!form?.theme) return;
    const root = document.documentElement;
    root.style.setProperty('--accent', form.theme.accent_color);
    root.style.setProperty('--accent-ink', form.theme.accent_ink || '#2F32B8');
    root.style.setProperty('--accent-soft', form.theme.accent_soft || '#ECEDFF');
  }, [form?.theme]);

  const handleUpdateForm = useCallback((updates: Partial<Form>) => {
    setForm((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      setIsSaving(true);
      DataStore.saveForm(next);
      setTimeout(() => setIsSaving(false), 300);
      return next;
    });
  }, []);

  const handleThemeChange = (updates: Partial<FormTheme>) => {
    if (!form) return;
    const nextTheme = { ...form.theme, ...updates };
    handleUpdateForm({ theme: nextTheme });
  };

  const handleAddQuestion = (type: QuestionType) => {
    if (!form) return;
    const questions = form.questions || [];
    const newQuestion = {
      id: 'q-' + Date.now(),
      form_id: form.id,
      type,
      label: getDefaultLabel(type),
      hint: '',
      required: false,
      position: questions.length + 1,
      options: type === 'multiple_choice' || type === 'checkbox' || type === 'dropdown'
        ? ['Pilihan 1', 'Pilihan 2', 'Pilihan 3']
        : null,
    };
    handleUpdateForm({ questions: [...questions, newQuestion] });
    setMobileTab('canvas');
  };

  const handleToggleIntegration = (type: 'whatsapp' | 'sheets') => {
    if (!form) return;
    const updated = DataStore.toggleIntegration(form.id, type);
    setIntegrations([...updated]);
  };

  const handlePublish = () => {
    if (!form) return;
    handleUpdateForm({
      status: 'published',
      published_at: form.published_at || new Date().toISOString(),
    });
    setIsShareModalOpen(true);
  };

  const handlePreview = () => {
    if (!form) return;
    window.open(`/f/${form.slug}`, '_blank');
  };

  if (!form) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ink-muted)' }}>Memuat formulir...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <BuilderTopbar
        title={form.title}
        onTitleChange={(title) => handleUpdateForm({ title })}
        onPreview={handlePreview}
        onPublish={handlePublish}
        isSaving={isSaving}
        status={form.status}
      />

      <div className="body">
        {/* Left: Block Palette */}
        <div className={`panel-wrap panel-left-wrap ${mobileTab === 'blocks' ? 'mobile-active' : ''}`}>
          <BlockPalette onAddQuestion={handleAddQuestion} />
        </div>

        {/* Center: Canvas */}
        <div className={`canvas-container ${mobileTab === 'canvas' ? 'mobile-active' : ''}`}>
          <FormCanvas
            form={form}
            onUpdateForm={handleUpdateForm}
            onAddQuestion={handleAddQuestion}
          />
        </div>

        {/* Right: Theme Panel */}
        <div className={`panel-wrap panel-right-wrap ${mobileTab === 'theme' ? 'mobile-active' : ''}`}>
          <ThemePanel
            theme={form.theme}
            onThemeChange={handleThemeChange}
            integrations={integrations}
            onToggleIntegration={handleToggleIntegration}
          />
        </div>
      </div>

      <BuilderMobileNav activeTab={mobileTab} onSelectTab={setMobileTab} />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        slug={form.slug}
        title={form.title}
      />

      <style jsx>{`
        .app {
          display: grid;
          grid-template-rows: 68px 1fr;
          height: 100vh;
          overflow: hidden;
        }
        .body {
          display: grid;
          grid-template-columns: 260px 1fr 296px;
          min-height: 0;
          height: calc(100vh - 68px);
        }
        .panel-wrap {
          overflow-y: auto;
          height: 100%;
        }
        .canvas-container {
          overflow-y: auto;
          height: 100%;
        }
        @media (max-width: 980px) and (min-width: 761px) {
          .panel-left-wrap {
            display: none;
          }
          .body {
            grid-template-columns: 1fr 280px;
          }
        }
        @media (max-width: 760px) {
          .app {
            grid-template-rows: 60px 1fr;
            height: 100dvh;
          }
          .body {
            display: block;
            position: relative;
            height: calc(100% - 60px);
            padding-bottom: calc(64px + env(safe-area-inset-bottom));
          }
          .panel-wrap,
          .canvas-container {
            display: none;
            width: 100%;
            height: 100%;
          }
          .panel-wrap.mobile-active {
            display: block;
          }
          .canvas-container.mobile-active {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}

function getDefaultLabel(type: QuestionType): string {
  switch (type) {
    case 'short_text': return 'Pertanyaan teks singkat';
    case 'paragraph': return 'Pertanyaan jawaban panjang';
    case 'multiple_choice': return 'Pilih salah satu jawaban';
    case 'checkbox': return 'Pilih opsi yang sesuai';
    case 'dropdown': return 'Pilih dari daftar';
    case 'date': return 'Pilih tanggal';
    case 'number': return 'Masukkan angka';
    case 'rating': return 'Beri nilai / penilaian';
    case 'file': return 'Unggah dokumen pendukung';
    default: return 'Pertanyaan baru';
  }
}
