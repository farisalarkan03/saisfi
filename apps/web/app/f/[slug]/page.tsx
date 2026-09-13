'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { DataStore } from '@/lib/store';
import { Form, Question } from '@/lib/types';

export default function PublicFormPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const found = DataStore.getFormBySlug(slug);
    if (found) {
      setForm(found);
      DataStore.incrementVisit(slug);

      // Apply theme to body
      const root = document.documentElement;
      root.style.setProperty('--accent', found.theme.accent_color);
      root.style.setProperty('--accent-ink', found.theme.accent_ink || '#2F32B8');
      root.style.setProperty('--accent-soft', found.theme.accent_soft || '#ECEDFF');
    }
  }, [slug]);

  if (!form) {
    return (
      <div className="center-container">
        <div className="loading-card">
          <span className="material-symbols-rounded" style={{ fontSize: '32px', color: 'var(--ink-faint)' }}>
            hourglass_empty
          </span>
          <h2>Formulir Tidak Ditemukan</h2>
          <p>Pastikan tautan sudah benar atau hubungi pemilik formulir.</p>
        </div>
        <style jsx>{`
          .center-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg);
            padding: 24px;
          }
          .loading-card {
            background: var(--surface);
            padding: 40px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--line);
            text-align: center;
            max-width: 440px;
          }
          .loading-card h2 {
            font-size: 20px;
            margin: 12px 0 6px;
          }
          .loading-card p {
            color: var(--ink-muted);
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  const questions = form.questions || [];
  const isOneByOne = form.theme.layout === 'one_by_one';
  const progressPercent = questions.length > 0 ? Math.round(((currentStep + 1) / questions.length) * 100) : 100;

  const handleAnswerChange = (questionId: string, val: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    setErrorMessage(null);
  };

  const validateCurrentStep = (stepIndex: number): boolean => {
    const q = questions[stepIndex];
    if (!q) return true;
    if (q.required) {
      const val = answers[q.id];
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        setErrorMessage(`Pertanyaan "${q.label}" wajib diisi.`);
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep(currentStep)) return;
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate all required fields
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          setErrorMessage(`Pertanyaan "${q.label}" wajib diisi.`);
          if (isOneByOne) {
            setCurrentStep(questions.findIndex((item) => item.id === q.id));
          }
          return;
        }
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Direct store submission (and optionally POST to Cloudflare worker if configured)
      DataStore.submitResponse(form.slug, answers);

      setIsSubmitted(true);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: [form.theme.accent_color, '#3DBE7A', '#FFB03A', '#8285FF'],
        });
      } catch (err) {
        console.log('Confetti effect executed', err);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Gagal mengirim respons');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  const getBackgroundStyle = () => {
    if (form.theme.background === 'gradient') {
      return { background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--bg) 500px)' };
    }
    if (form.theme.background === 'image') {
      return {
        backgroundImage: 'radial-gradient(#D0D0E2 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        backgroundColor: 'var(--bg)',
      };
    }
    return { background: 'var(--bg)' };
  };

  const fontFamilyStyle = {
    fontFamily: form.theme.font.includes('Inter') ? "'Inter', sans-serif" : "'Plus Jakarta Sans', sans-serif",
  };

  return (
    <div className="public-runner" style={getBackgroundStyle()}>
      {/* Form Card Container */}
      <div className="form-container">
        {/* Progress bar for step mode */}
        {isOneByOne && !isSubmitted && (
          <div className="step-progress-wrap">
            <div className="step-progress-bar">
              <div className="step-progress-fill" style={{ width: `${progressPercent}%`, background: form.theme.accent_color }} />
            </div>
            <span className="step-text">
              {currentStep + 1} dari {questions.length}
            </span>
          </div>
        )}

        {/* Cover Header */}
        <div
          className="form-cover"
          style={{
            background:
              form.theme.cover_gradient ||
              `linear-gradient(135deg, ${form.theme.accent_color} 0%, ${form.theme.accent_ink || '#2F32B8'} 100%)`,
          }}
        />

        {/* Submission Success Screen */}
        {isSubmitted ? (
          <div className="card success-card animate-rise">
            <div className="success-icon" style={{ background: '#E7F7EF', color: '#22B07D' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '36px' }}>
                verified
              </span>
            </div>
            <h1 className="success-title" style={fontFamilyStyle}>
              Terima Kasih!
            </h1>
            <p className="success-desc">
              Jawaban Anda telah berhasil kami terima dan tersimpan dengan aman.
            </p>
            <div className="success-meta">
              <span>Waktu submit: {new Date().toLocaleTimeString('id-ID')}</span>
              <span>•</span>
              <span>Status: Terverifikasi</span>
            </div>
            <button className="btn btn-ghost" onClick={resetForm} style={{ marginTop: '24px' }}>
              <span className="material-symbols-rounded">restart_alt</span>
              <span>Kirim Jawaban Lain</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Header Description */}
            <div className="card form-header-card">
              <h1 className="title" style={fontFamilyStyle}>{form.title}</h1>
              {form.description && <p className="desc">{form.description}</p>}
            </div>

            {errorMessage && (
              <div className="error-alert animate-rise">
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Questions Rendering */}
            {isOneByOne ? (
              // Step-by-step layout
              <div className="card q-card-step animate-rise" key={questions[currentStep]?.id}>
                {questions[currentStep] && renderQuestionCard(questions[currentStep], currentStep + 1, answers, handleAnswerChange, form.theme.accent_color)}

                <div className="step-nav-actions">
                  {currentStep > 0 && (
                    <button type="button" className="btn btn-ghost" onClick={handlePrevStep}>
                      <span className="material-symbols-rounded">arrow_back</span>
                      <span>Kembali</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextStep}
                    style={{ marginLeft: 'auto' }}
                    disabled={isSubmitting}
                  >
                    <span>{currentStep === questions.length - 1 ? (isSubmitting ? 'Mengirim...' : 'Kirim Jawaban') : 'Lanjut'}</span>
                    <span className="material-symbols-rounded">
                      {currentStep === questions.length - 1 ? 'check' : 'arrow_forward'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              // All at once layout
              <div className="all-questions-list">
                {questions.map((q, idx) => (
                  <div key={q.id} className="card q-card-single">
                    {renderQuestionCard(q, idx + 1, answers, handleAnswerChange, form.theme.accent_color)}
                  </div>
                ))}

                <div className="submit-section">
                  <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
                    <span className="material-symbols-rounded">send</span>
                    <span>{isSubmitting ? 'Sedang Mengirim...' : 'Kirim Formulir'}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Saisfi Footer Branding */}
        <div className="powered-footer">
          <span>Didukung oleh</span>
          <div className="brand-pill">
            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: '#5B5FEF' }}>draw</span>
            <span>Saisfi Edge</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .public-runner {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 40px 16px 80px;
          transition: background 300ms ease;
        }
        .form-container {
          max-width: 640px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .step-progress-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }
        .step-progress-bar {
          flex: 1;
          height: 6px;
          background: var(--surface-alt);
          border-radius: 999px;
          overflow: hidden;
        }
        .step-progress-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 300ms cubic-bezier(.2, .8, .2, 1);
        }
        .step-text {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-muted);
        }
        .form-cover {
          height: 128px;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-ambient);
        }
        .card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 26px 28px;
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
        }
        .form-header-card {
          border-top: 4px solid var(--accent);
        }
        .title {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.015em;
          margin-bottom: 8px;
        }
        .desc {
          font-size: 14.5px;
          color: var(--ink-muted);
          line-height: 1.6;
        }
        .error-alert {
          background: #FFF0F0;
          border: 1px solid #FFD4D4;
          color: var(--danger);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 13.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .all-questions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .q-card-single, .q-card-step {
          position: relative;
        }
        .step-nav-actions {
          display: flex;
          align-items: center;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--line);
        }
        .submit-section {
          display: flex;
          justify-content: flex-end;
          padding: 8px 0;
        }
        .submit-btn {
          padding: 13px 28px;
          font-size: 15px;
        }
        .success-card {
          text-align: center;
          padding: 48px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .success-icon {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .success-title {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .success-desc {
          font-size: 15px;
          color: var(--ink-muted);
          max-width: 420px;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .success-meta {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: var(--ink-faint);
        }
        .powered-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          font-size: 12.5px;
          color: var(--ink-muted);
        }
        .brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          color: var(--ink);
        }
        @media (max-width: 600px) {
          .public-runner {
            padding: 16px 12px 60px;
          }
          .card {
            padding: 20px 18px;
          }
          .title {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}

function renderQuestionCard(
  q: Question,
  num: number,
  answers: Record<string, unknown>,
  onAnswerChange: (id: string, val: unknown) => void,
  accentColor: string
) {
  const currentVal = answers[q.id];

  return (
    <div className="q-item">
      <div className="q-header">
        <span className="q-badge">{num}</span>
        <div style={{ flex: 1 }}>
          <label className="q-label">
            {q.label}
            {q.required && <span className="q-req"> *</span>}
          </label>
          {q.hint && <p className="q-hint">{q.hint}</p>}
        </div>
      </div>

      <div className="q-body">
        {q.type === 'short_text' && (
          <input
            className="input-text"
            placeholder="Tuliskan jawaban Anda di sini..."
            value={(currentVal as string) || ''}
            onChange={(e) => onAnswerChange(q.id, e.target.value)}
          />
        )}

        {q.type === 'paragraph' && (
          <textarea
            className="input-textarea"
            rows={4}
            placeholder="Tuliskan jawaban lengkap di sini..."
            value={(currentVal as string) || ''}
            onChange={(e) => onAnswerChange(q.id, e.target.value)}
          />
        )}

        {q.type === 'number' && (
          <input
            type="number"
            className="input-text"
            style={{ maxWidth: '240px' }}
            placeholder="0"
            value={(currentVal as string) || ''}
            onChange={(e) => onAnswerChange(q.id, e.target.value)}
          />
        )}

        {q.type === 'date' && (
          <input
            type="date"
            className="input-text"
            style={{ maxWidth: '240px' }}
            value={(currentVal as string) || ''}
            onChange={(e) => onAnswerChange(q.id, e.target.value)}
          />
        )}

        {q.type === 'multiple_choice' && (
          <div className="choices-group">
            {(q.options || []).map((opt, i) => {
              const isSelected = currentVal === opt;
              return (
                <div
                  key={i}
                  className={`choice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onAnswerChange(q.id, opt)}
                >
                  <div className={`radio-circle ${isSelected ? 'on' : ''}`} />
                  <span className="choice-text">{opt}</span>
                </div>
              );
            })}
          </div>
        )}

        {q.type === 'checkbox' && (
          <div className="choices-group">
            {(q.options || []).map((opt, i) => {
              const selectedList = (Array.isArray(currentVal) ? currentVal : []) as string[];
              const isChecked = selectedList.includes(opt);

              const toggleCheckbox = () => {
                if (isChecked) {
                  onAnswerChange(
                    q.id,
                    selectedList.filter((item) => item !== opt)
                  );
                } else {
                  onAnswerChange(q.id, [...selectedList, opt]);
                }
              };

              return (
                <div
                  key={i}
                  className={`choice-card ${isChecked ? 'selected' : ''}`}
                  onClick={toggleCheckbox}
                >
                  <div className={`check-box ${isChecked ? 'on' : ''}`}>
                    {isChecked && <span className="material-symbols-rounded">check</span>}
                  </div>
                  <span className="choice-text">{opt}</span>
                </div>
              );
            })}
          </div>
        )}

        {q.type === 'dropdown' && (
          <select
            className="input-select"
            value={(currentVal as string) || ''}
            onChange={(e) => onAnswerChange(q.id, e.target.value)}
          >
            <option value="">-- Pilih salah satu --</option>
            {(q.options || []).map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {q.type === 'rating' && (
          <div className="star-rating-row">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = typeof currentVal === 'number' && currentVal >= star;
              return (
                <button
                  type="button"
                  key={star}
                  className="star-btn"
                  onClick={() => onAnswerChange(q.id, star)}
                  style={{ color: isFilled ? accentColor : '#D2D2E0' }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: '34px' }}>
                    star
                  </span>
                </button>
              );
            })}
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)', marginLeft: '8px' }}>
              {typeof currentVal === 'number' ? `${currentVal} dari 5 bintang` : 'Pilih nilai'}
            </span>
          </div>
        )}

        {q.type === 'file' && (
          <div className="file-box">
            <input
              type="file"
              id={`file-${q.id}`}
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onAnswerChange(q.id, file.name);
                }
              }}
            />
            <label htmlFor={`file-${q.id}`} className="file-drop-btn">
              <span className="material-symbols-rounded" style={{ fontSize: '30px', color: 'var(--ink-muted)' }}>
                cloud_upload
              </span>
              <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                {currentVal ? `File: ${currentVal}` : 'Klik untuk mengunggah file'}
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--ink-faint)' }}>
                Maksimal 10MB (PDF, JPG, PNG)
              </span>
            </label>
          </div>
        )}
      </div>

      <style jsx>{`
        .q-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }
        .q-badge {
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
          flex: none;
          margin-top: 1px;
        }
        .q-label {
          font-size: 15.5px;
          font-weight: 600;
          color: var(--ink);
          display: block;
          margin-bottom: 2px;
        }
        .q-req {
          color: var(--danger);
        }
        .q-hint {
          font-size: 12.5px;
          color: var(--ink-muted);
          line-height: 1.4;
        }
        .input-text, .input-textarea, .input-select {
          width: 100%;
          padding: 11px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: var(--surface-alt);
          font-size: 14px;
          color: var(--ink);
          outline: none;
          font-family: inherit;
          transition: border-color var(--transition), background var(--transition);
        }
        .input-text:focus, .input-textarea:focus, .input-select:focus {
          border-color: var(--accent);
          background: var(--surface);
        }
        .choices-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .choice-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--line);
          background: var(--surface);
          cursor: pointer;
          transition: border-color var(--transition), background var(--transition);
        }
        .choice-card:hover {
          background: var(--surface-alt);
        }
        .choice-card.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .radio-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #C9C9D3;
          flex: none;
        }
        .radio-circle.on {
          border-color: var(--accent);
          background: radial-gradient(circle, var(--accent) 0 42%, transparent 44%);
        }
        .check-box {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 2px solid #C9C9D3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .check-box.on {
          border-color: var(--accent);
          background: var(--accent);
          color: #fff;
        }
        .check-box .material-symbols-rounded {
          font-size: 14px;
        }
        .choice-text {
          font-size: 14px;
          color: var(--ink);
        }
        .star-rating-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .star-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 2px;
          transition: transform 120ms ease;
        }
        .star-btn:hover {
          transform: scale(1.15);
        }
        .file-drop-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 24px;
          border: 2px dashed var(--line);
          border-radius: var(--radius-md);
          background: var(--surface-alt);
          cursor: pointer;
          transition: border-color var(--transition);
        }
        .file-drop-btn:hover {
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}
