'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SubjectItem, ClassItem, User } from '@/types';
import { BookPlus, Trash2, UserCheck, BookMarked } from 'lucide-react';

export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [classId, setClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, clsRes, userRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes'),
        api.get('/users?role=Teacher&pageSize=100')
      ]);
      setSubjects(subRes.data || []);
      setClasses(clsRes.data || []);
      setTeachers(userRes.data?.items || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/subjects', { name, code, classId });
      setShowCreateModal(false);
      setName('');
      setCode('');
      setClassId('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedTeacherId) return;
    try {
      await api.post(`/subjects/${selectedSubjectId}/teachers`, { teacherId: selectedTeacherId });
      setShowAssignModal(false);
      fetchData();
    } catch {
      alert('Failed to assign teacher');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchData();
    } catch {
      alert('Failed to delete subject');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Subject Management
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Map subjects to grade classes and assign faculty members
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAssignModal(true)} className="btn btn-secondary">
            <UserCheck className="w-4 h-4" />
            <span>Assign Teacher</span>
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <BookPlus className="w-4 h-4" />
            <span>Create Subject</span>
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <BookMarked className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <BookMarked className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No subjects created yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Code</th>
                <th>Enrolled Class</th>
                <th>Assigned Teachers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold text-white">{s.name}</td>
                  <td className="font-mono text-xs text-amber-400">{s.code}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.className}</td>
                  <td>
                    {s.assignedTeachers.length === 0 ? (
                      <span className="text-xs italic" style={{ color: 'var(--text-dim)' }}>None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {s.assignedTeachers.map((t) => (
                          <span key={t.id} className="badge badge-teacher text-[10px]">
                            {t.fullName}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteSubject(s.id)}
                      className="btn-icon danger"
                      title="Delete Subject"
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

      {/* Create Subject Modal */}
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
              Create New Subject
            </h3>
            {error && <div className="p-3 bg-rose-500/20 text-rose-300 text-xs rounded-xl border border-rose-500/30">{error}</div>}
            
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS101"
                  className="input-field"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Target Class</label>
                <select
                  required
                  className="input-field"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
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
              Assign Teacher to Subject
            </h3>
            
            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Select Subject</label>
                <select
                  required
                  className="input-field"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Select Teacher</label>
                <select
                  required
                  className="input-field"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
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
                  Assign Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
