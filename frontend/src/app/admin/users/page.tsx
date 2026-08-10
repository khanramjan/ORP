'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, UserRole } from '@/types';
import { UserPlus, Trash2, Users } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [error, setError] = useState('');

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

  const filters = ['', 'Admin', 'Teacher', 'Student'];
  const filterLabels: Record<string, string> = { '': 'All', Admin: 'Admin', Teacher: 'Teacher', Student: 'Student' };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            User Management
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage accounts, roles, and permissions
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Card */}
      <div className="card p-0 overflow-hidden">
        {/* Filter tabs */}
        <div
          className="flex items-center gap-1 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(139,92,246,0.14)' }}
        >
          <span className="text-xs font-medium mr-3" style={{ color: 'var(--text-muted)' }}>Filter:</span>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={roleFilter === f ? {
                background: 'linear-gradient(135deg, #6d28d9, #f59e0b)',
                color: '#fff',
              } : {
                background: 'rgba(139,92,246,0.08)',
                color: 'var(--text-muted)',
                border: '1px solid rgba(139,92,246,0.18)',
              }}
            >
              {filterLabels[f]}
            </button>
          ))}
          <span className="ml-auto text-xs" style={{ color: 'var(--text-dim)' }}>
            {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-semibold text-white">{u.fullName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="btn-icon danger"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
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
          <div
            className="w-full max-w-md rounded-2xl p-7 space-y-5"
            style={{
              background: 'rgba(14, 10, 26, 0.98)',
              border: '1px solid rgba(139,92,246,0.35)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
          >
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Create New User
            </h3>

            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.12)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.3)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: 'Full Name', type: 'text',     val: fullName, set: setFullName, ph: 'Jane Doe' },
                { label: 'Email',     type: 'email',    val: email,    set: setEmail,    ph: 'jane@school.com' },
                { label: 'Password',  type: 'password', val: password, set: setPassword, ph: '••••••••' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    required
                    className="input-field"
                    placeholder={f.ph}
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Role
                </label>
                <select className="input-field" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
