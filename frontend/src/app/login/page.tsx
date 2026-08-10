'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowRight, AlertCircle, Shield, School, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 text-zinc-200 mb-1">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">EduAssign</h1>
          <p className="text-xs text-zinc-400">Sign in to your academic portal</p>
        </div>

        {/* Login Card */}
        <div className="card p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="name@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 mt-1 text-xs font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-2">
            <div className="text-[11px] text-zinc-500 font-medium text-center uppercase tracking-wider">
              Quick Fill Accounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@school.com', 'Admin@123')}
                className="btn btn-secondary text-xs py-2 flex-col gap-1 border-zinc-800 hover:border-zinc-700"
              >
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher@school.com', 'Teacher@123')}
                className="btn btn-secondary text-xs py-2 flex-col gap-1 border-zinc-800 hover:border-zinc-700"
              >
                <School className="w-3.5 h-3.5 text-zinc-400" />
                <span>Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student@school.com', 'Student@123')}
                className="btn btn-secondary text-xs py-2 flex-col gap-1 border-zinc-800 hover:border-zinc-700"
              >
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                <span>Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
