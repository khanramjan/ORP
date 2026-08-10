'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { LogOut, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="h-14 w-full bg-[#121215] border-b border-[rgba(255,255,255,0.08)] sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-200">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-zinc-100 tracking-tight">EduAssign</span>
          <span className="text-xs text-zinc-500 font-normal">/ OnnoRokom</span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 text-xs text-zinc-300">
          <span className="font-medium text-zinc-100">{user.fullName}</span>
          <span className={`badge badge-${user.role.toLowerCase()}`}>
            {user.role}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-zinc-800" />

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
