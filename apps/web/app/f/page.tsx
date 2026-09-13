import { Suspense } from 'react';
import PublicFormClient from './[slug]/PublicFormClient';

export default function PublicFormRootPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg, #0F1117)',
            color: 'var(--ink, #fff)',
          }}
        >
          <p style={{ opacity: 0.7 }}>Memuat formulir...</p>
        </div>
      }
    >
      <PublicFormClient />
    </Suspense>
  );
}
