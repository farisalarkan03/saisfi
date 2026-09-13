'use client';

import React from 'react';

export type ActiveMobileTab = 'blocks' | 'canvas' | 'theme';

interface BuilderMobileNavProps {
  activeTab: ActiveMobileTab;
  onSelectTab: (tab: ActiveMobileTab) => void;
}

export const BuilderMobileNav: React.FC<BuilderMobileNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <nav className="mobile-nav">
      <button
        className={`mobile-nav-btn ${activeTab === 'blocks' ? 'active' : ''}`}
        onClick={() => onSelectTab('blocks')}
      >
        <span className="material-symbols-rounded">add_box</span>
        <span>Blok</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'canvas' ? 'active' : ''}`}
        onClick={() => onSelectTab('canvas')}
      >
        <span className="material-symbols-rounded">description</span>
        <span>Formulir</span>
      </button>

      <button
        className={`mobile-nav-btn ${activeTab === 'theme' ? 'active' : ''}`}
        onClick={() => onSelectTab('theme')}
      >
        <span className="material-symbols-rounded">palette</span>
        <span>Tema</span>
      </button>

      <style jsx>{`
        .mobile-nav {
          display: none;
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 64px;
          padding-bottom: env(safe-area-inset-bottom);
          background: var(--surface);
          border-top: 1px solid var(--line);
          z-index: 30;
        }
        .mobile-nav-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          background: none;
          border: none;
          color: var(--ink-faint);
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          padding: 8px 0 4px;
          cursor: pointer;
          transition: color var(--transition);
        }
        .mobile-nav-btn .material-symbols-rounded {
          font-size: 22px;
        }
        .mobile-nav-btn.active {
          color: var(--accent);
        }
        @media (max-width: 760px) {
          .mobile-nav {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
};
