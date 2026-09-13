import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saisfi — Modern Form Builder & Management Platform',
  description: 'Bangun formulir online interaktif dengan performa edge berkecepatan tinggi, integrasi WhatsApp, dan analitik respons real-time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,-50..200"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
