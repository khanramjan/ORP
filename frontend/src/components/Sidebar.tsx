'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard, Users, BookMarked,
  FolderKanban, FileCheck, UploadCloud
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const overviewLinks: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
  ];

  const adminLinks: NavItem[] = [
    { href: '/admin/users',    label: 'Users',    icon: <Users size={15} /> },
    { href: '/admin/classes',  label: 'Classes',  icon: <FolderKanban size={15} /> },
    { href: '/admin/subjects', label: 'Subjects', icon: <BookMarked size={15} /> },
  ];

  const teacherLinks: NavItem[] = [
    { href: '/teacher/assignments', label: 'Assignments', icon: <FileCheck size={15} /> },
  ];

  const studentLinks: NavItem[] = [
    { href: '/student/assignments', label: 'Assignments',  icon: <FileCheck size={15} /> },
    { href: '/student/submissions', label: 'Submissions',  icon: <UploadCloud size={15} /> },
  ];

  const renderSection = (title: string, links: NavItem[]) => (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-3)',
        padding: '0 12px 8px',
      }}>
        {title}
      </div>
      {links.map(({ href, label, icon }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '8px 12px', borderRadius: '8px',
              marginBottom: '2px',
              fontSize: '13.5px', fontWeight: active ? 600 : 400,
              color: active ? 'var(--text-1)' : 'var(--text-2)',
              background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
              transition: 'all 0.12s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLDivElement).style.color = 'var(--text-1)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                (e.currentTarget as HTMLDivElement).style.color = 'var(--text-2)';
              }
            }}
            >
              <span style={{ color: active ? 'var(--indigo-light)' : 'var(--text-3)', flexShrink: 0 }}>
                {icon}
              </span>
              {label}
              {active && (
                <div style={{
                  marginLeft: 'auto', width: '4px', height: '4px',
                  borderRadius: '50%', background: 'var(--indigo)',
                }} />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside style={{
      width: '220px',
      minHeight: 'calc(100vh - 56px)',
      background: 'var(--bg-elevated)',
      borderRight: '1px solid var(--border)',
      padding: '20px 12px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div>
        {renderSection('Navigation', overviewLinks)}
        {user.role === 'Admin' && renderSection('Management', adminLinks)}
        {(user.role === 'Teacher' || user.role === 'Admin') && renderSection('Academic', teacherLinks)}
        {user.role === 'Student' && renderSection('My Work', studentLinks)}
      </div>

      {/* Role badge footer */}
      <div style={{
        padding: '10px 12px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        fontSize: '12px',
        color: 'var(--text-3)',
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: '2px' }}>{user.fullName}</div>
        <div>{user.role} Account</div>
      </div>
    </aside>
  );
};
