'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ClassItem, User } from '@/types';
import { Plus, Trash2, UserPlus, Users, BookMarked, X } from 'lucide-react';

export default function ClassManagementPage() {
  const [classes,          setClasses]          = useState<ClassItem[]>([]);
  const [students,         setStudents]         = useState<User[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [showCreate,       setShowCreate]       = useState(false);
  const [showEnroll,       setShowEnroll]       = useState(false);
  const [selectedClassId,  setSelectedClassId]  = useState('');
  const [name,             setName]             = useState('');
  const [description,      setDescription]      = useState('');
  const [selectedStudentId,setSelectedStudentId]= useState('');
  const [error,            setError]            = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, u] = await Promise.all([
        api.get('/classes'),
        api.get('/users?role=Student&pageSize=100'),
      ]);
      setClasses(c.data || []);
      setStudents(u.data?.items || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/classes', { name, description });
      setShowCreate(false); setName(''); setDescription(''); fetchData();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to create class'); }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedStudentId) return;
    try {
      await api.post(`/classes/${selectedClassId}/students`, { studentId: selectedStudentId });
      setShowEnroll(false); fetchData();
    } catch { alert('Failed to enroll student'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    try { await api.delete(`/classes/${id}`); fetchData(); }
    catch { alert('Failed to delete class'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            Class Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
            Create class sections and manage student enrollments
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowEnroll(true)}>
            <UserPlus size={14} /> Enroll Student
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create Class
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>Loading classes…</div>
      ) : classes.length === 0 ? (
        <div style={{
          padding: '64px', textAlign: 'center', color: 'var(--text-3)',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
        }}>
          No classes yet. Create your first class.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {classes.map(c => (
            <div key={c.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '14px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-1)' }}>{c.name}</h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-3)', marginTop: '4px', lineHeight: 1.5 }}>
                    {c.description || 'No description provided.'}
                  </p>
                </div>
                <button className="btn-icon danger" onClick={() => handleDelete(c.id)} title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '12px', fontWeight: 500,
                  padding: '4px 10px', borderRadius: '6px',
                  background: 'var(--indigo-dim)', color: 'var(--indigo-light)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}>
                  <Users size={12} /> {c.studentCount} students
                </span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '12px', fontWeight: 500,
                  padding: '4px 10px', borderRadius: '6px',
                  background: 'var(--cyan-dim)', color: 'var(--cyan)',
                  border: '1px solid rgba(34,211,238,0.2)',
                }}>
                  <BookMarked size={12} /> {c.subjectCount} subjects
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '420px', padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>Create Class</h2>
              <button className="btn-icon" onClick={() => setShowCreate(false)}><X size={15} /></button>
            </div>
            {error && <div style={{ padding: '9px 13px', background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '7px', color: '#fb7185', fontSize: '13px', marginBottom: '18px' }}>{error}</div>}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Class Name</label>
                <input type="text" required className="input-field" placeholder="e.g. Class 10-A" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Description</label>
                <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical' }} placeholder="Brief description…" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {showEnroll && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '420px', padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>Enroll Student</h2>
              <button className="btn-icon" onClick={() => setShowEnroll(false)}><X size={15} /></button>
            </div>
            <form onSubmit={handleEnroll} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Select Class</label>
                <select required className="input-field" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                  <option value="">— Choose class —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Select Student</label>
                <select required className="input-field" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                  <option value="">— Choose student —</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEnroll(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Enroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
