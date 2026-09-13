import { Suspense } from 'react';
import ResponsesClient from './ResponsesClient';

export function generateStaticParams() {
  return [
    { id: 'form-event-registration' },
    { id: 'pendaftaran-event' },
    { id: 'default' }
  ];
}

export default function ResponsesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--ink-muted)' }}>
          Memuat respons formulir...
        </div>
      }
    >
      <ResponsesClient />
    </Suspense>
  );
}
