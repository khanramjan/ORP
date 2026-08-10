'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Users, 
  BookMarked, 
  FolderKanban, 
  FileCheck, 
  UploadCloud 
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navLinkStyle = (active: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
      active
        ? 'bg-zinc-800 text-zinc-100'
        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
    }`;

  return (
    <aside className="w-56 min-h-[calc(100vh-56px)] bg-[#09090b] border-r border-[rgba(255,255,255,0.08)] p-3 flex flex-col gap-1">
      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-1.5">
        Overview
      </div>
      <Link href="/dashboard" className={navLinkStyle(pathname === '/dashboard')}>
        <LayoutDashboard className="w-4 h-4 text-zinc-400" />
        <span>Dashboard</span>
      </Link>

      {/* Admin Specific Links */}
      {user.role === 'Admin' && (
        <>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-1.5 mt-4">
            Management
          </div>
          <Link href="/admin/users" className={navLinkStyle(isActive('/admin/users'))}>
            <Users className="w-4 h-4 text-zinc-400" />
            <span>Users</span>
          </Link>
          <Link href="/admin/classes" className={navLinkStyle(isActive('/admin/classes'))}>
            <FolderKanban className="w-4 h-4 text-zinc-400" />
            <span>Classes</span>
          </Link>
          <Link href="/admin/subjects" className={navLinkStyle(isActive('/admin/subjects'))}>
            <BookMarked className="w-4 h-4 text-zinc-400" />
            <span>Subjects</span>
          </Link>
        </>
      )}

      {/* Teacher Specific Links */}
      {(user.role === 'Teacher' || user.role === 'Admin') && (
        <>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-1.5 mt-4">
            Academic
          </div>
          <Link href="/teacher/assignments" className={navLinkStyle(isActive('/teacher/assignments'))}>
            <FileCheck className="w-4 h-4 text-zinc-400" />
            <span>Assignments</span>
          </Link>
        </>
      )}

      {/* Student Specific Links */}
      {user.role === 'Student' && (
        <>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-1.5 mt-4">
            My Workspace
          </div>
          <Link href="/student/assignments" className={navLinkStyle(isActive('/student/assignments'))}>
            <FileCheck className="w-4 h-4 text-zinc-400" />
            <span>Assignments</span>
          </Link>
          <Link href="/student/submissions" className={navLinkStyle(isActive('/student/submissions'))}>
            <UploadCloud className="w-4 h-4 text-zinc-400" />
            <span>Submissions</span>
          </Link>
        </>
      )}
    </aside>
  );
};
