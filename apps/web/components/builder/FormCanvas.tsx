'use client';

import React, { useState } from 'react';
import { Form, Question, QuestionType } from '@/lib/types';

interface FormCanvasProps {
  form: Form;
  onUpdateForm: (updates: Partial<Form>) => void;
  onSelectQuestion?: (q: Question) => void;
  onAddQuestion: (type: QuestionType) => void;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  form,
  onUpdateForm,
  onAddQuestion,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    form.questions?.[0]?.id || null
  );

  const questions = form.questions || [];

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, ...updates } : q));
    onUpdateForm({ questions: updated });
  };

  const deleteQuestion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = questions.filter((q) => q.id !== id);
    onUpdateForm({ questions: updated });
    if (selectedQuestionId === id) {
      setSelectedQuestionId(updated[0]?.id || null);
    }
  };

  const duplicateQuestion = (question: Question, e: React.MouseEvent) => {
    e.stopPropagation();
    const newQ: Question = {
      ...question,
      id: 'q-' + Date.now(),
      label: `${question.label} (Salinan)`,
      position: questions.length + 1,
    };
    onUpdateForm({ questions: [...questions, newQ] });
    setSelectedQuestionId(newQ.id);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIdx];
    newQuestions[targetIdx] = temp;
    onUpdateForm({ questions: newQuestions });
  };

  const addOption = (questionId: string, options: string[] = []) => {
    const newOptions = [...options, `Opsi ${options.length + 1}`];
    updateQuestion(questionId, { options: newOptions });
  };

  const updateOptionText = (questionId: string, options: string[], optIndex: number, text: string) => {
    const newOptions = [...options];
    newOptions[optIndex] = text;
    updateQuestion(questionId, { options: newOptions });
  };

  const removeOption = (questionId: string, options: string[], optIndex: number) => {
    const newOptions = options.filter((_, idx) => idx !== optIndex);
    updateQuestion(questionId, { options: newOptions });
  };

  const getBackgroundStyle = () => {
    if (form.theme.background === 'gradient') {
      return { background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--bg) 400px)' };
    }
    if (form.theme.background === 'image') {
      return {
        backgroundImage: 'radial-gradient(#D5D5E8 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    }
    return { background: 'var(--bg)' };
  };

  return (
    <div className="canvas-wrap" style={getBackgroundStyle()}>
      <div className="doc">
        {/* Cover Header */}
        <div
          className="cover"
          style={{
            background:
              form.theme.cover_gradient ||
              `linear-gradient(135deg, ${form.theme.accent_color}CC 0%, ${form.theme.accent_color} 55%, ${form.theme.accent_ink || '#3B36B2'} 100%)`,
          }}
        >
          <div className="cover-badge">
            <span className="material-symbols-rounded">visibility</span>
            <span>{form.visit_count || 0} kunjungan</span>
          </div>
        </div>

        {/* Form Title & Description Card */}
        <div className="card form-head">
          <input
            className="head-title-input"
            value={form.title}
            onChange={(e) => onUpdateForm({ title: e.target.value })}
            placeholder="Judul Formulir..."
            style={{
              fontFamily: form.theme.font.includes('Inter')
                ? "'Inter', sans-serif"
                : "'Plus Jakarta Sans', sans-serif",
            }}
          />
          <textarea
            className="head-desc-input"
            value={form.description || ''}
            onChange={(e) => onUpdateForm({ description: e.target.value })}
            placeholder="Tambahkan petunjuk atau deskripsi untuk responden..."
            rows={2}
          />
        </div>

        {/* Question Cards */}
        {questions.map((q, index) => {
          const isSelected = selectedQuestionId === q.id;

          return (
            <div
              key={q.id}
              className={`card q-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedQuestionId(q.id)}
            >
              {isSelected && (
                <div className="q-toolbar">
                  <button
                    className="icon-btn"
                    style={{ width: '28px', height: '28px' }}
                    title="Naikkan"
                    onClick={(e) => moveQuestion(index, 'up', e)}
                    disabled={index === 0}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
                      arrow_upward
                    </span>
                  </button>
                  <button
                    className="icon-btn"
                    style={{ width: '28px', height: '28px' }}
                    title="Turunkan"
                    onClick={(e) => moveQuestion(index, 'down', e)}
                    disabled={index === questions.length - 1}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
                      arrow_downward
                    </span>
                  </button>
                  <button
                    className="icon-btn"
                    style={{ width: '28px', height: '28px' }}
                    title="Duplikasi"
                    onClick={(e) => duplicateQuestion(q, e)}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
                      content_copy
                    </span>
                  </button>
                  <button
                    className="icon-btn delete-btn"
                    style={{ width: '28px', height: '28px' }}
                    title="Hapus"
                    onClick={(e) => deleteQuestion(q.id, e)}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
                      delete
                    </span>
                  </button>
                </div>
              )}

              <div className="q-top">
                <div className="q-num">{index + 1}</div>
                <div className="q-body">
                  <div className="q-label-row">
                    <input
                      className="q-label-input"
                      value={q.label}
                      onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                      placeholder="Tulis pertanyaan..."
                    />
                    <label className="required-toggle" title="Wajib diisi">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                      />
                      <span className="q-required">* Wajib</span>
                    </label>
                  </div>

                  <input
                    className="q-hint-input"
                    value={q.hint || ''}
                    onChange={(e) => updateQuestion(q.id, { hint: e.target.value })}
                    placeholder="Petunjuk opsional untuk responden..."
                  />
                </div>

                <div className="q-type-chip">
                  <span className="material-symbols-rounded">{getTypeIcon(q.type)}</span>
                  <span>{getTypeName(q.type)}</span>
                </div>
              </div>

              {/* Render Question Inputs depending on type */}
              <div className="q-input-area">
                {q.type === 'short_text' && (
                  <div className="fake-input" style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                    <span style={{ color: 'var(--ink-faint)', fontSize: '13px' }}>Jawaban singkat teks responden...</span>
                  </div>
                )}

                {q.type === 'paragraph' && (
                  <div className="fake-textarea" style={{ padding: '10px 12px' }}>
                    <span style={{ color: 'var(--ink-faint)', fontSize: '13px' }}>Jawaban paragraf panjang responden...</span>
                  </div>
                )}

                {q.type === 'number' && (
                  <div className="fake-input" style={{ width: '180px' }}>
                    <span style={{ color: 'var(--ink-faint)', fontSize: '13px' }}>0123...</span>
                  </div>
                )}

                {q.type === 'date' && (
                  <div className="fake-input" style={{ width: '220px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                    <span style={{ color: 'var(--ink-faint)', fontSize: '13.5px' }}>DD / MM / YYYY</span>
                    <span className="material-symbols-rounded" style={{ color: 'var(--ink-faint)', fontSize: '18px' }}>event</span>
                  </div>
                )}

                {q.type === 'multiple_choice' && (
                  <div className="options-container">
                    {(q.options || ['Opsi 1', 'Opsi 2']).map((opt, optIdx) => (
                      <div key={optIdx} className="option-row">
                        <div className={`radio-dot ${optIdx === 0 ? 'on' : ''}`} />
                        <input
                          className="option-input"
                          value={opt}
                          onChange={(e) => updateOptionText(q.id, q.options || [], optIdx, e.target.value)}
                        />
                        {(q.options?.length || 0) > 1 && (
                          <button
                            className="opt-remove-btn"
                            onClick={() => removeOption(q.id, q.options || [], optIdx)}
                            title="Hapus opsi"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      className="option-add"
                      onClick={() => addOption(q.id, q.options || ['Opsi 1', 'Opsi 2'])}
                    >
                      + Tambah opsi
                    </button>
                  </div>
                )}

                {q.type === 'checkbox' && (
                  <div className="options-container">
                    {(q.options || ['Pilihan A', 'Pilihan B']).map((opt, optIdx) => (
                      <div key={optIdx} className="option-row">
                        <div className="check-box-fake">
                          {optIdx === 0 && <span className="material-symbols-rounded">check</span>}
                        </div>
                        <input
                          className="option-input"
                          value={opt}
                          onChange={(e) => updateOptionText(q.id, q.options || [], optIdx, e.target.value)}
                        />
                        {(q.options?.length || 0) > 1 && (
                          <button
                            className="opt-remove-btn"
                            onClick={() => removeOption(q.id, q.options || [], optIdx)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      className="option-add"
                      onClick={() => addOption(q.id, q.options || ['Pilihan A', 'Pilihan B'])}
                    >
                      + Tambah pilihan centang
                    </button>
                  </div>
                )}

                {q.type === 'dropdown' && (
                  <div className="options-container">
                    <div className="fake-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--ink-muted)', fontSize: '13.5px' }}>Pilih opsi dropdown...</span>
                      <span className="material-symbols-rounded">expand_more</span>
                    </div>
                    {(q.options || ['Item 1', 'Item 2']).map((opt, optIdx) => (
                      <div key={optIdx} className="option-row" style={{ padding: '6px 10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--ink-faint)', minWidth: '18px' }}>{optIdx + 1}.</span>
                        <input
                          className="option-input"
                          value={opt}
                          onChange={(e) => updateOptionText(q.id, q.options || [], optIdx, e.target.value)}
                        />
                      </div>
                    ))}
                    <button
                      className="option-add"
                      onClick={() => addOption(q.id, q.options || ['Item 1', 'Item 2'])}
                    >
                      + Tambah item dropdown
                    </button>
                  </div>
                )}

                {q.type === 'rating' && (
                  <div className="rating-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="rating-star" style={{ color: form.theme.accent_color }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '28px' }}>star</span>
                      </div>
                    ))}
                    <span style={{ fontSize: '12.5px', color: 'var(--ink-faint)', marginLeft: '8px' }}>
                      Skala 1 - 5
                    </span>
                  </div>
                )}

                {q.type === 'file' && (
                  <div className="file-dropzone">
                    <span className="material-symbols-rounded" style={{ fontSize: '28px', color: 'var(--ink-muted)' }}>
                      cloud_upload
                    </span>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                      Pilih file atau seret ke sini
                    </p>
                    <p style={{ fontSize: '11.5px', color: 'var(--ink-faint)' }}>
                      Maksimal 10 MB (PDF, JPG, PNG) disimpan di Supabase Storage
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Question Button */}
        <button
          className="add-block-btn"
          onClick={() => onAddQuestion('short_text')}
        >
          <span className="material-symbols-rounded">add</span>
          <span>Tambah pertanyaan</span>
        </button>
      </div>

      <style jsx>{`
        .canvas-wrap {
          overflow-y: auto;
          padding: 36px 24px 80px;
          display: flex;
          justify-content: center;
          min-height: calc(100vh - 68px);
          transition: background 300ms ease;
        }
        .doc {
          width: 100%;
          max-width: 620px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: rise 520ms cubic-bezier(.2, .8, .2, 1);
        }
        .cover {
          height: 132px;
          border-radius: var(--radius-xl);
          position: relative;
          box-shadow: var(--shadow-ambient);
          overflow: hidden;
          transition: background 300ms ease;
        }
        .cover::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(120% 90% at 15% 0%, rgba(255, 255, 255, 0.35), transparent 55%);
        }
        .cover-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(6px);
          color: #fff;
          font-size: 11.5px;
          font-weight: 600;
          padding: 6px 11px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
        }
        .cover-badge .material-symbols-rounded {
          font-size: 14px;
        }
        .card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 22px 24px;
          box-shadow: var(--shadow-soft);
          border: 1px solid var(--line);
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .form-head {
          border-top: 4px solid var(--accent);
        }
        .head-title-input {
          width: 100%;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.015em;
          border: none;
          outline: none;
          background: transparent;
          color: var(--ink);
          margin-bottom: 8px;
        }
        .head-desc-input {
          width: 100%;
          font-size: 14px;
          color: var(--ink-muted);
          line-height: 1.55;
          border: none;
          outline: none;
          background: transparent;
          font-family: inherit;
          resize: none;
        }
        .q-card {
          position: relative;
          cursor: pointer;
        }
        .q-card.selected {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft), var(--shadow-soft);
        }
        .q-toolbar {
          position: absolute;
          right: 18px;
          top: -18px;
          display: flex;
          align-items: center;
          gap: 3px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 3px 6px;
          box-shadow: var(--shadow-soft);
          z-index: 10;
        }
        .delete-btn:hover {
          color: var(--danger) !important;
        }
        .q-top {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }
        .q-num {
          flex: none;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: var(--surface-alt);
          color: var(--ink-muted);
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }
        .q-body {
          flex: 1;
          min-width: 0;
        }
        .q-label-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }
        .q-label-input {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: inherit;
        }
        .required-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: var(--ink-faint);
          cursor: pointer;
          white-space: nowrap;
        }
        .q-required {
          color: #EF5A5A;
          font-size: 12px;
          font-weight: 600;
        }
        .q-hint-input {
          font-size: 12.5px;
          color: var(--ink-faint);
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-family: inherit;
        }
        .q-type-chip {
          flex: none;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--ink-muted);
          background: var(--surface-alt);
          padding: 5px 10px;
          border-radius: 999px;
        }
        .q-type-chip .material-symbols-rounded {
          font-size: 14px;
        }
        .fake-input {
          height: 42px;
          border-radius: var(--radius-sm);
          background: var(--surface-alt);
          border: 1px solid var(--line);
        }
        .fake-textarea {
          height: 76px;
          border-radius: var(--radius-sm);
          background: var(--surface-alt);
          border: 1px solid var(--line);
        }
        .options-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .option-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: var(--surface);
        }
        .option-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 13.5px;
          color: var(--ink);
          background: transparent;
        }
        .opt-remove-btn {
          border: none;
          background: transparent;
          color: var(--ink-faint);
          font-size: 16px;
          cursor: pointer;
          padding: 0 4px;
        }
        .opt-remove-btn:hover {
          color: var(--danger);
        }
        .radio-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #C9C9D3;
          flex: none;
        }
        .radio-dot.on {
          border-color: var(--accent);
          background: radial-gradient(circle, var(--accent) 0 42%, transparent 44%);
        }
        .check-box-fake {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 2px solid var(--accent);
          background: var(--accent);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .check-box-fake .material-symbols-rounded {
          font-size: 13px;
        }
        .option-add {
          font-size: 13px;
          color: var(--accent);
          padding: 6px 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-weight: 600;
          display: inline-block;
          border-radius: 8px;
        }
        .option-add:hover {
          background: var(--accent-soft);
        }
        .rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 4px;
        }
        .rating-star {
          cursor: default;
        }
        .file-dropzone {
          border: 1.5px dashed var(--line);
          border-radius: var(--radius-md);
          padding: 20px;
          text-align: center;
          background: var(--surface-alt);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .add-block-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px;
          border-radius: var(--radius-lg);
          border: 1.5px dashed #D2D2E0;
          color: var(--ink-muted);
          font-size: 13.5px;
          font-weight: 600;
          background: transparent;
          cursor: pointer;
          transition: border-color var(--transition), color var(--transition), background var(--transition);
        }
        .add-block-btn:hover {
          border-color: var(--accent);
          color: var(--accent-ink);
          background: var(--accent-soft);
        }
        @media (max-width: 760px) {
          .canvas-wrap {
            padding: 18px 14px 40px;
          }
          .cover {
            height: 96px;
          }
          .card {
            padding: 16px 18px;
          }
          .head-title-input {
            font-size: 20px;
          }
          .q-toolbar {
            position: static;
            justify-content: flex-end;
            margin-bottom: 8px;
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

function getTypeIcon(type: QuestionType): string {
  switch (type) {
    case 'short_text': return 'short_text';
    case 'paragraph': return 'notes';
    case 'multiple_choice': return 'radio_button_checked';
    case 'checkbox': return 'check_box';
    case 'dropdown': return 'arrow_drop_down_circle';
    case 'date': return 'calendar_month';
    case 'number': return 'tag';
    case 'rating': return 'star';
    case 'file': return 'upload_file';
    default: return 'help';
  }
}

function getTypeName(type: QuestionType): string {
  switch (type) {
    case 'short_text': return 'Teks singkat';
    case 'paragraph': return 'Paragraf';
    case 'multiple_choice': return 'Pilihan ganda';
    case 'checkbox': return 'Kotak centang';
    case 'dropdown': return 'Dropdown';
    case 'date': return 'Tanggal';
    case 'number': return 'Angka';
    case 'rating': return 'Rating';
    case 'file': return 'Unggah file';
    default: return type;
  }
}
