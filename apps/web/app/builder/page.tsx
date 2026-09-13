'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataStore } from '@/lib/store';

export default function BuilderIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const forms = DataStore.getForms();
    if (forms.length > 0) {
      router.replace(`/builder/${forms[0].id}`);
    } else {
      const newForm = DataStore.createForm();
      router.replace(`/builder/${newForm.id}`);
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--ink-muted)' }}>Membuka form builder...</p>
    </div>
  );
}
