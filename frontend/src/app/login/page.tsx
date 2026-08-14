'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, AlertCircle, Shield, School, GraduationCap, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const router    = useRouter();

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

  const demoAccounts = [
    { role: 'Admin',   email: 'admin@school.com',   pass: 'Admin@123',   icon: <Shield size={14} />,        color: '#fb7185' },
    { role: 'Teacher', email: 'teacher@school.com', pass: 'Teacher@123', icon: <School size={14} />,        color: '#818cf8' },
    { role: 'Student', email: 'student@school.com', pass: 'Student@123', icon: <GraduationCap size={14} />, color: '#22d3ee' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '48px', height: '48px',
            background: 'var(--indigo)',
            borderRadius: '12px',
            marginBottom: '14px',
          }}>
            <BookOpen size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
            Sign in to EduAssign
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-3)', marginTop: '6px' }}>
            Academic Assignment & Submission Portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '28px',
        }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px',
              background: 'var(--rose-dim)',
              border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: '8px',
              color: '#fb7185',
              fontSize: '13px',
              marginBottom: '20px',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '7px' }}>
                Email address
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@school.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '7px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-3)', padding: '4px', display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: 600, justifyContent: 'center' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '11.5px', color: 'var(--text-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Quick demo access
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Demo Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {demoAccounts.map(({ role, email: dEmail, pass, icon, color }) => (
              <button
                key={role}
                type="button"
                onClick={() => { setEmail(dEmail); setPassword(pass); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '12px 8px',
                  background: `${color}0d`,
                  border: `1px solid ${color}25`,
                  borderRadius: '9px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  color: color,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${color}18`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}50`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${color}0d`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}25`;
                }}
              >
                {icon}
                <span style={{ fontSize: '11.5px', fontWeight: 600 }}>{role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
