'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DataStore } from '@/lib/store';
import { UserRole } from '@/lib/types';

export const DashboardHeader: React.FC = () => {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>('user');
  const [user, setUser] = useState(DataStore.getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setRole(DataStore.getCurrentRole());
    setUser(DataStore.getCurrentUser());

    const handleRoleChange = () => {
      setRole(DataStore.getCurrentRole());
      setUser(DataStore.getCurrentUser());
    };

    window.addEventListener('saisfi_role_changed', handleRoleChange);
    return () => window.removeEventListener('saisfi_role_changed', handleRoleChange);
  }, []);

  const toggleRole = () => {
    const nextRole: UserRole = role === 'admin' ? 'user' : 'admin';
    DataStore.setCurrentRole(nextRole);
    setRole(nextRole);
    setUser(DataStore.getCurrentUser());
  };

  const isActive = (path: string, exact = false) =>
    exact ? pathname === path : pathname?.startsWith(path);

  return (
    <header className="dash-header">
      {/* ── LEFT: Brand + Main Nav ── */}
      <div className="dash-left">
        <Link href="/dashboard" className="dash-brand-link">
          <div className="dash-brand">
            <div className="dash-mark">
              <span className="material-symbols-rounded">draw</span>
            </div>
            <span className="dash-brand-name">Saisfi</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="nav-divider" />

        {/* Main nav */}
        <nav className="dash-nav">
          <Link
            href="/dashboard"
            className={`nav-link ${isActive('/dashboard', true) ? 'active' : ''}`}
          >
            <span className="material-symbols-rounded">dynamic_form</span>
            <span>Formulir Saya</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className={`nav-link ${isActive('/dashboard/settings') ? 'active' : ''}`}
          >
            <span className="material-symbols-rounded">settings</span>
            <span>Pengaturan</span>
          </Link>
        </nav>

        {/* Admin nav — visually separated */}
        <div className="admin-nav-section">
          <div className="admin-nav-separator">
            <span className="material-symbols-rounded admin-sep-icon">lock</span>
          </div>
          <nav className="admin-nav">
            <Link
              href="/admin"
              className={`nav-link admin-link ${isActive('/admin') ? 'active-admin' : ''}`}
            >
              <span className="material-symbols-rounded">shield_person</span>
              <span>Area Admin</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* ── RIGHT: Role switch + Profile ── */}
      <div className="dash-right">
        <button
          className={`role-toggle ${role === 'admin' ? 'is-admin' : ''}`}
          onClick={toggleRole}
          title="Klik untuk beralih Mode Pengguna / Mode Admin"
        >
          <span className="material-symbols-rounded" style={{ fontSize: '15px' }}>
            {role === 'admin' ? 'verified_user' : 'person'}
          </span>
          <span>{role === 'admin' ? 'Mode Admin' : 'Mode Pengguna'}</span>
          <span className="switch-hint">Ganti</span>
        </button>

        <div className="user-profile">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name || 'U')}`}
            alt={user.full_name || 'User'}
            className="user-avatar"
          />
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className="user-plan badge badge-pro">{user.plan}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ── HEADER SHELL ── */
        .dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 64px;
          background: var(--surface);
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
          z-index: 40;
          backdrop-filter: blur(12px);
        }

        /* ── LEFT GROUP ── */
        .dash-left {
          display: flex;
          align-items: center;
          gap: 0;
        }

        /* ── BRAND ── */
        .dash-brand-link {
          text-decoration: none;
          color: inherit;
          flex-shrink: 0;
        }
        .dash-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: var(--ink);
        }
        .dash-mark {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(145deg, #6C6FFF 0%, #4A46E0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px -3px rgba(91, 95, 239, 0.5);
        }
        .dash-mark .material-symbols-rounded {
          color: #fff;
          font-size: 17px;
        }
        .dash-brand-name {
          background: linear-gradient(135deg, #5B5FEF, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── DIVIDERS ── */
        .nav-divider {
          width: 1px;
          height: 28px;
          background: var(--line);
          margin: 0 20px;
          flex-shrink: 0;
        }

        /* ── MAIN NAV ── */
        .dash-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: 10px;
          color: var(--ink-muted);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.18s, color 0.18s;
          letter-spacing: -0.01em;
        }
        .nav-link:hover {
          background: var(--surface-alt);
          color: var(--ink);
        }
        .nav-link.active {
          background: var(--accent-soft);
          color: var(--accent-ink);
        }
        .nav-link .material-symbols-rounded {
          font-size: 17px;
        }

        /* ── ADMIN SECTION ── */
        .admin-nav-section {
          display: flex;
          align-items: center;
          margin-left: 12px;
          padding-left: 12px;
          border-left: 1px dashed #D1C8F8;
          gap: 6px;
        }
        .admin-nav-separator {
          display: flex;
          align-items: center;
        }
        .admin-sep-icon {
          font-size: 13px;
          color: #A78BFA;
          opacity: 0.7;
        }
        .admin-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .admin-link {
          color: #7C6FAE;
          background: #F5F3FF;
          border: 1px solid #E9E4FF;
        }
        .admin-link:hover {
          background: #EDE9FE;
          color: #5B21B6;
          border-color: #D8B4FE;
        }
        .admin-link.active-admin {
          background: linear-gradient(135deg, #EDE9FE, #F5F3FF);
          color: #4C1D95;
          border-color: #C4B5FD;
          box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.15);
        }

        /* ── RIGHT GROUP ── */
        .dash-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* ── ROLE TOGGLE ── */
        .role-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--surface-alt);
          border: 1px solid var(--line);
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-muted);
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }
        .role-toggle:hover {
          background: #EEEEFF;
          color: var(--ink);
          border-color: #C4B5FD;
        }
        .role-toggle.is-admin {
          background: #EDEFFF;
          border-color: #C9CEFF;
          color: #3B36B2;
        }
        .switch-hint {
          font-size: 10px;
          opacity: 0.55;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* ── PROFILE ── */
        .user-profile {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 4px 8px 4px 4px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: var(--surface-alt);
          cursor: pointer;
          transition: border-color 0.18s;
        }
        .user-profile:hover {
          border-color: #C4B5FD;
        }
        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--surface-alt);
          border: 1px solid var(--line);
          object-fit: cover;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding-right: 4px;
        }
        .user-name {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .dash-header { padding: 0 16px; }
          .admin-nav-section { display: none; }
          .user-info { display: none; }
        }
        @media (max-width: 680px) {
          .dash-nav { display: none; }
          .nav-divider { display: none; }
        }
      `}</style>
    </header>
  );
};
