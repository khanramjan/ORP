'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { LogOut, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const roleColor: Record<string, string> = {
    Admin:   '#fb7185',
    Teacher: '#818cf8',
    Student: '#22d3ee',
  };

  return (
    <header style={{
      height: '56px',
      background: 'var(--bg-elevated)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'var(--indigo)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            EduAssign
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '-2px' }}>
            OnnoRokom Projukti
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Avatar */}
          <div style={{
            width: '30px', height: '30px',
            background: 'var(--indigo-dim)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: 'var(--indigo-light)',
          }}>
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.2 }}>
              {user.fullName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.2 }}>
              {user.email}
            </div>
          </div>
          {/* Role pill */}
          <span style={{
            padding: '2px 9px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 600,
            color: roleColor[user.role] ?? '#94a3b8',
            background: `${roleColor[user.role] ?? '#94a3b8'}18`,
            border: `1px solid ${roleColor[user.role] ?? '#94a3b8'}30`,
          }}>
            {user.role}
          </span>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: 'var(--text-3)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 10px', borderRadius: '7px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,63,94,0.08)';
            (e.currentTarget as HTMLButtonElement).style.color = '#fb7185';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)';
          }}
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
};
