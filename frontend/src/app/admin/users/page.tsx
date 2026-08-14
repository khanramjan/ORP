'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, UserRole } from '@/types';
import { UserPlus, Trash2, Users, X } from 'lucide-react';

export default function UserManagementPage() {
  const [users,       setUsers]       = useState<User[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [roleFilter,  setRoleFilter]  = useState('');
  const [email,       setEmail]       = useState('');
  const [fullName,    setFullName]    = useState('');
  const [password,    setPassword]    = useState('');
  const [role,        setRole]        = useState<UserRole>('Student');
  const [error,       setError]       = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = roleFilter ? `/users?role=${roleFilter}` : '/users';
      const res = await api.get(url);
      setUsers(res.data?.items || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', { email, fullName, password, role });
      setShowModal(false);
      setEmail(''); setFullName(''); setPassword(''); setRole('Student');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); fetchUsers(); }
    catch { alert('Failed to delete user'); }
  };

  const filters = [
    { value: '',        label: 'All' },
    { value: 'Admin',   label: 'Admin' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Student', label: 'Student' },
  ];

  const roleColor: Record<string, string> = { Admin: '#fb7185', Teacher: '#818cf8', Student: '#22d3ee' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            User Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
            Manage accounts, roles, and access permissions
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={14} /> Add User
        </button>
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Filters */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '14px 18px', borderBottom: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.1)',
        }}>
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              style={{
                padding: '5px 13px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 500,
                cursor: 'pointer', border: '1px solid',
                borderColor: roleFilter === f.value ? 'var(--indigo)' : 'var(--border)',
                background:  roleFilter === f.value ? 'var(--indigo-dim)' : 'transparent',
                color:       roleFilter === f.value ? 'var(--indigo-light)' : 'var(--text-3)',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-3)' }}>
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-3)' }}>
            <Users size={28} style={{ opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '13.5px' }}>Loading…</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13.5px' }}>
            No users found.
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: `${roleColor[u.role] ?? '#94a3b8'}18`,
                        border: `1px solid ${roleColor[u.role] ?? '#94a3b8'}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700,
                        color: roleColor[u.role] ?? '#94a3b8',
                        flexShrink: 0,
                      }}>
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.fullName}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-3)', fontSize: '13px' }}>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role.toLowerCase()}`}>
                      <span className="badge-dot" />{u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-3)', fontSize: '12.5px' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(u.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '420px', padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>Create User</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>

            {error && (
              <div style={{ padding: '9px 13px', background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '7px', color: '#fb7185', fontSize: '13px', marginBottom: '18px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Full Name', type: 'text',     val: fullName, set: setFullName, ph: 'Jane Smith' },
                { label: 'Email',     type: 'email',    val: email,    set: setEmail,    ph: 'jane@school.com' },
                { label: 'Password',  type: 'password', val: password, set: setPassword, ph: '••••••••' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>
                    {f.label}
                  </label>
                  <input type={f.type} required className="input-field" placeholder={f.ph}
                    value={f.val} onChange={e => f.set(e.target.value)} />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Role</label>
                <select className="input-field" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
