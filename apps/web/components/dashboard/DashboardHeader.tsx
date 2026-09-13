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

  const isAdminSection = pathname?.startsWith('/admin');

  return (
    <header className="dash-header">
      <div className="dash-left">
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="dash-brand">
            <div className="dash-mark">
              <span className="material-symbols-rounded">draw</span>
            </div>
            <span className="dash-brand-name">Saisfi</span>
            {isAdminSection && <span className="dash-admin-chip">Admin Platform</span>}
          </div>
        </Link>

        <nav className="dash-nav">
          <Link
            href="/dashboard"
            className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
          >
            <span className="material-symbols-rounded">dynamic_form</span>
            <span>Formulir Saya</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className={`nav-link ${pathname === '/dashboard/settings' ? 'active' : ''}`}
          >
            <span className="material-symbols-rounded">settings</span>
            <span>Pengaturan</span>
          </Link>
          <Link
            href="/admin"
            className={`nav-link ${pathname?.startsWith('/admin') ? 'active' : ''}`}
          >
            <span className="material-symbols-rounded">admin_panel_settings</span>
            <span>Area Admin</span>
          </Link>
        </nav>
      </div>

      <div className="dash-right">
        {/* Quick Role Switcher for seamless testing */}
        <button
          className={`role-toggle ${role === 'admin' ? 'is-admin' : ''}`}
          onClick={toggleRole}
          title="Klik untuk beralih antara Mode Pengguna dan Mode Admin"
        >
          <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
            {role === 'admin' ? 'verified_user' : 'person'}
          </span>
          <span>Peran: {role === 'admin' ? 'Admin' : 'Pengguna'}</span>
          <span className="switch-hint">Ganti</span>
        </button>

        <div className="user-profile">
          <img src={user.avatar_url || ''} alt={user.full_name || 'User'} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className="user-plan badge badge-pro">{user.plan}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 70px;
          background: var(--surface);
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .dash-left {
          display: flex;
          align-items: center;
          gap: 36px;
        }
        .dash-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 20px;
          cursor: pointer;
        }
        .dash-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(155deg, #6C6FFF 0%, #4A46E0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px -3px rgba(91, 95, 239, 0.55);
        }
        .dash-mark .material-symbols-rounded {
          color: #fff;
          font-size: 19px;
        }
        .dash-admin-chip {
          font-size: 11px;
          background: #5B5FEF;
          color: #fff;
          padding: 3px 8px;
          border-radius: 999px;
          font-weight: 700;
          letter-spacing: 0.03em;
        }
        .dash-nav {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          color: var(--ink-muted);
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          transition: background var(--transition), color var(--transition);
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
          font-size: 18px;
        }
        .dash-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .role-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--surface-alt);
          border: 1px solid var(--line);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink);
          cursor: pointer;
          transition: background var(--transition), border-color var(--transition);
        }
        .role-toggle:hover {
          background: #E4E4EE;
        }
        .role-toggle.is-admin {
          background: #EDEFFF;
          border-color: #C9CEFF;
          color: #3B36B2;
        }
        .switch-hint {
          font-size: 10.5px;
          color: var(--ink-faint);
          text-decoration: underline;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 6px;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--surface-alt);
          border: 1px solid var(--line);
        }
        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }
        @media (max-width: 860px) {
          .dash-header {
            padding: 0 16px;
          }
          .dash-nav {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
