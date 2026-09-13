import { Suspense } from 'react';
import BuilderClient from './BuilderClient';

export function generateStaticParams() {
  return [{ id: 'form-event-registration' }, { id: 'default' }];
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span className="material-symbols-rounded" style={{ fontSize: 32, color: 'var(--ink-faint)' }}>progress_activity</span>
      </div>
    }>
      <BuilderClient />
    </Suspense>
  );
}
