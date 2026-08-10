'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ClassItem, User } from '@/types';
import { FolderPlus, Trash2, UserPlus, Users, FolderKanban } from 'lucide-react';

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, userRes] = await Promise.all([
        api.get('/classes'),
        api.get('/users?role=Student&pageSize=100')
      ]);
      setClasses(clsRes.data || []);
      setStudents(userRes.data?.items || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/classes', { name, description });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create class');
    }
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedStudentId) return;
    try {
      await api.post(`/classes/${selectedClassId}/students`, { studentId: selectedStudentId });
      setShowAssignModal(false);
      fetchData();
    } catch {
      alert('Failed to assign student');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      fetchData();
    } catch {
      alert('Failed to delete class');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Class Management
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Configure academic classes and student enrollments
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAssignModal(true)} className="btn btn-secondary">
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <FolderPlus className="w-4 h-4" />
            <span>Create Class</span>
          </button>
        </div>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <FolderKanban className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <FolderKanban className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No classes created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl flex flex-col justify-between space-y-4"
                style={{
                  background: 'rgba(139,92,246,0.06)',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.name}</h3>
                    <button
                      onClick={() => handleDeleteClass(c.id)}
                      className="btn-icon danger"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs mt-1 text-slate-400">{c.description || 'No description provided'}</p>
                </div>

                <div className="flex items-center gap-4 text-xs pt-3" style={{ borderTop: '1px solid rgba(139,92,246,0.12)' }}>
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{c.studentCount} Students</span>
                  </div>
                  <div className="text-purple-300 font-semibold">
                    <span>{c.subjectCount} Subjects</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
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
              Create New Class
            </h3>
            {error && <div className="p-3 bg-rose-500/20 text-rose-300 text-xs rounded-xl border border-rose-500/30">{error}</div>}
            
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10-A"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  className="input-field min-h-[80px]"
                  placeholder="Brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showAssignModal && (
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
              Enroll Student into Class
            </h3>
            
            <form onSubmit={handleAssignStudent} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Select Class</label>
                <select
                  required
                  className="input-field"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Select Student</label>
                <select
                  required
                  className="input-field"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
