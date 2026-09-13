'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;

    // 1. Tangani rute formulir publik /f/slug-apa-saja/
    if (pathname.startsWith('/f/')) {
      const parts = pathname.split('/').filter(Boolean);
      // parts[0] === 'f', parts[1] === slug
      if (parts[1] && parts[1] !== 'default') {
        const slug = parts[1];
        window.location.replace(`/f?slug=${encodeURIComponent(slug)}`);
        return;
      }
    }

    // 2. Tangani rute builder /builder/form-xxx
    if (pathname.startsWith('/builder/')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts[1] && parts[1] !== 'default') {
        const id = parts[1];
        window.location.replace(`/builder/default?id=${encodeURIComponent(id)}`);
        return;
      }
    }

    // 3. Tangani rute responses /dashboard/forms/form-xxx/responses
    if (pathname.includes('/responses')) {
      const match = pathname.match(/\/dashboard\/forms\/([^/]+)\/responses/);
      if (match && match[1] && match[1] !== 'default') {
        window.location.replace(`/dashboard/forms/default/responses?id=${encodeURIComponent(match[1])}`);
        return;
      }
    }

    setIsRedirecting(false);
  }, []);

  if (isRedirecting) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F1117',
          color: '#fff',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <p style={{ opacity: 0.7, fontSize: '15px' }}>Menghubungkan ke formulir...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F1117',
        color: '#fff',
        textAlign: 'center',
        padding: '24px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <h1 style={{ fontSize: '64px', margin: 0, fontWeight: 800, color: '#5B5FEF' }}>404</h1>
      <h2 style={{ fontSize: '22px', marginTop: '14px', marginBottom: '8px', color: '#fff' }}>
        Halaman Tidak Ditemukan
      </h2>
      <p style={{ color: '#8F95B2', maxWidth: '380px', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>
        Halaman atau formulir yang Anda cari tidak ditemukan atau telah dipindahkan.
      </p>
      <Link
        href="/dashboard"
        style={{
          background: '#5B5FEF',
          color: '#fff',
          padding: '10px 22px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
