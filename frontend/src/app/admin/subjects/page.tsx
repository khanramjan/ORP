'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SubjectItem, ClassItem, User } from '@/types';
import { Plus, Trash2, UserCheck, X } from 'lucide-react';

export default function SubjectManagementPage() {
  const [subjects,          setSubjects]          = useState<SubjectItem[]>([]);
  const [classes,           setClasses]           = useState<ClassItem[]>([]);
  const [teachers,          setTeachers]          = useState<User[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [showCreate,        setShowCreate]        = useState(false);
  const [showAssign,        setShowAssign]        = useState(false);
  const [name,              setName]              = useState('');
  const [code,              setCode]              = useState('');
  const [classId,           setClassId]           = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [error,             setError]             = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, c, u] = await Promise.all([
        api.get('/subjects'), api.get('/classes'),
        api.get('/users?role=Teacher&pageSize=100'),
      ]);
      setSubjects(s.data || []); setClasses(c.data || []);
      setTeachers(u.data?.items || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/subjects', { name, code, classId });
      setShowCreate(false); setName(''); setCode(''); setClassId(''); fetchData();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to create subject'); }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedTeacherId) return;
    try {
      await api.post(`/subjects/${selectedSubjectId}/teachers`, { teacherId: selectedTeacherId });
      setShowAssign(false); fetchData();
    } catch { alert('Failed to assign teacher'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try { await api.delete(`/subjects/${id}`); fetchData(); }
    catch { alert('Failed to delete subject'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            Subject Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
            Map subjects to classes and assign teachers
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowAssign(true)}>
            <UserCheck size={14} /> Assign Teacher
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create Subject
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
        ) : subjects.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13.5px' }}>
            No subjects yet.
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Code</th><th>Class</th><th>Teachers</th><th></th></tr></thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td>
                    <code style={{
                      fontSize: '12px', fontWeight: 600,
                      padding: '2px 8px', borderRadius: '5px',
                      background: 'var(--amber-dim)', color: 'var(--amber)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}>{s.code}</code>
                  </td>
                  <td style={{ color: 'var(--text-3)' }}>{s.className}</td>
                  <td>
                    {s.assignedTeachers.length === 0
                      ? <span style={{ fontSize: '12.5px', color: 'var(--text-3)', fontStyle: 'italic' }}>Unassigned</span>
                      : s.assignedTeachers.map(t => (
                          <span key={t.id} className="badge badge-teacher" style={{ marginRight: '4px', fontSize: '11.5px' }}>
                            <span className="badge-dot" />{t.fullName}
                          </span>
                        ))
                    }
                  </td>
                  <td>
                    <button className="btn-icon danger" onClick={() => handleDelete(s.id)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '420px', padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>Create Subject</h2>
              <button className="btn-icon" onClick={() => setShowCreate(false)}><X size={15} /></button>
            </div>
            {error && <div style={{ padding: '9px 13px', background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '7px', color: '#fb7185', fontSize: '13px', marginBottom: '18px' }}>{error}</div>}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Subject Name</label>
                <input type="text" required className="input-field" placeholder="e.g. Computer Science" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Subject Code</label>
                <input type="text" required className="input-field" placeholder="e.g. CS101" value={code} onChange={e => setCode(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Target Class</label>
                <select required className="input-field" value={classId} onChange={e => setClassId(e.target.value)}>
                  <option value="">— Select class —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '420px', padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>Assign Teacher</h2>
              <button className="btn-icon" onClick={() => setShowAssign(false)}><X size={15} /></button>
            </div>
            <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Select Subject</label>
                <select required className="input-field" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
                  <option value="">— Choose subject —</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Select Teacher</label>
                <select required className="input-field" value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
                  <option value="">— Choose teacher —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssign(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
