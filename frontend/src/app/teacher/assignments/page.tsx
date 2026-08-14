'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AssignmentItem, ClassItem, SubjectItem, SubmissionItem, AssignmentStatus } from '@/types';
import { Plus, Eye, Trash2, CheckSquare, X, Award } from 'lucide-react';

export default function TeacherAssignmentsPage() {
  const [assignments,    setAssignments]    = useState<AssignmentItem[]>([]);
  const [classes,        setClasses]        = useState<ClassItem[]>([]);
  const [subjects,       setSubjects]       = useState<SubjectItem[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [showCreate,     setShowCreate]     = useState(false);
  const [showReview,     setShowReview]     = useState(false);
  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [classId,        setClassId]        = useState('');
  const [subjectId,      setSubjectId]      = useState('');
  const [maxMarks,       setMaxMarks]       = useState(100);
  const [deadline,       setDeadline]       = useState('');
  const [status,         setStatus]         = useState<AssignmentStatus>('Draft');
  const [allowLate,      setAllowLate]      = useState(false);
  const [formError,      setFormError]      = useState('');
  const [activeAssign,   setActiveAssign]   = useState<AssignmentItem | null>(null);
  const [submissions,    setSubmissions]    = useState<SubmissionItem[]>([]);
  const [selectedSub,    setSelectedSub]    = useState<SubmissionItem | null>(null);
  const [marksInput,     setMarksInput]     = useState(0);
  const [feedbackInput,  setFeedbackInput]  = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, c, s] = await Promise.all([
        api.get('/assignments?pageSize=100'),
        api.get('/classes'), api.get('/subjects'),
      ]);
      setAssignments(a.data?.items || []);
      setClasses(c.data || []);
      setSubjects(s.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setClassId(''); setSubjectId('');
    setMaxMarks(100); setDeadline(''); setStatus('Draft'); setAllowLate(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError('');
    try {
      await api.post('/assignments', {
        title, description, classId, subjectId,
        maxMarks, deadline: new Date(deadline).toISOString(), status, allowLateSubmission: allowLate,
      });
      setShowCreate(false); resetForm(); fetchAll();
    } catch (err: any) { setFormError(err.response?.data?.message || 'Failed to create'); }
  };

  const handleToggle = async (id: string) => {
    try { await api.patch(`/assignments/${id}/publish`); fetchAll(); }
    catch { alert('Failed to update status'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try { await api.delete(`/assignments/${id}`); fetchAll(); }
    catch { alert('Failed to delete'); }
  };

  const handleOpenReview = async (a: AssignmentItem) => {
    setActiveAssign(a);
    try {
      const res = await api.get(`/assignments/${a.id}/submissions`);
      setSubmissions(res.data || []); setShowReview(true);
    } catch { alert('Failed to load submissions'); }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    try {
      await api.put(`/submissions/${selectedSub.id}/review`, {
        marks: marksInput, feedback: feedbackInput, status: 'Reviewed',
      });
      setSelectedSub(null);
      if (activeAssign) {
        const res = await api.get(`/assignments/${activeAssign.id}/submissions`);
        setSubmissions(res.data || []);
      }
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to save review'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            Assignments
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
            Create, publish, and evaluate coursework
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New Assignment
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
        ) : assignments.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13.5px' }}>
            No assignments yet. Create one to get started.
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Title</th><th>Class / Subject</th><th>Deadline</th><th>Max</th><th>Subs</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{a.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>{a.description?.slice(0,60)}{a.description?.length > 60 ? '…' : ''}</div>
                  </td>
                  <td style={{ color: 'var(--text-3)', fontSize: '13px' }}>{a.className} · {a.subjectName}</td>
                  <td style={{ color: 'var(--text-3)', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                    {new Date(a.deadline).toLocaleDateString()}
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)' }}>{a.maxMarks}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--indigo-light)' }}>{a.totalSubmissions}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggle(a.id)}
                      className={`badge badge-${a.status === 'Published' ? 'published' : 'draft'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle"
                    >
                      <span className="badge-dot" />{a.status}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '12.5px', gap: '5px' }} onClick={() => handleOpenReview(a)}>
                        <Eye size={13} /> View
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(a.id)} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
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
          <div className="modal-card" style={{ width: '100%', maxWidth: '520px', padding: '26px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>Create Assignment</h2>
              <button className="btn-icon" onClick={() => { setShowCreate(false); resetForm(); }}><X size={15} /></button>
            </div>
            {formError && <div style={{ padding: '9px 13px', background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '7px', color: '#fb7185', fontSize: '13px', marginBottom: '18px' }}>{formError}</div>}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Title</label>
                <input type="text" required className="input-field" placeholder="Assignment title" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Description / Instructions</label>
                <textarea required className="input-field" style={{ minHeight: '90px', resize: 'vertical' }} placeholder="Describe the task…" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Class</label>
                  <select required className="input-field" value={classId} onChange={e => setClassId(e.target.value)}>
                    <option value="">— Select —</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Subject</label>
                  <select required className="input-field" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                    <option value="">— Select —</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Max Marks</label>
                  <input type="number" min={1} required className="input-field" value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Deadline</label>
                  <input type="datetime-local" required className="input-field" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Status</label>
                  <select className="input-field" value={status} onChange={e => setStatus(e.target.value as AssignmentStatus)}>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
                <div style={{ paddingBottom: '1px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-2)' }}>
                    <input type="checkbox" checked={allowLate} onChange={e => setAllowLate(e.target.checked)} style={{ accentColor: 'var(--indigo)', width: '15px', height: '15px' }} />
                    Allow late submissions
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && activeAssign && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '680px', padding: '26px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>{activeAssign.title}</h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-3)', marginTop: '3px' }}>
                  Submissions · Max marks: <strong style={{ color: 'var(--amber)' }}>{activeAssign.maxMarks}</strong>
                </p>
              </div>
              <button className="btn-icon" onClick={() => { setShowReview(false); setSelectedSub(null); }}><X size={15} /></button>
            </div>

            {submissions.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13.5px' }}>
                No submissions yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {submissions.map(sub => (
                  <div key={sub.id} style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '13.5px' }}>{sub.studentName}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-3)', marginLeft: '8px' }}>({sub.studentEmail})</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {sub.isLate && (
                          <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: 'var(--rose-dim)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.2)', fontWeight: 600 }}>
                            Late
                          </span>
                        )}
                        <span className={`badge badge-${sub.status.toLowerCase()}`}>
                          <span className="badge-dot" />{sub.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {sub.answerText}
                    </div>

                    {sub.attachmentUrl && (
                      <a href={sub.attachmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: 'var(--indigo-light)', textDecoration: 'none' }}>
                        📎 View attachment
                      </a>
                    )}

                    {sub.marks != null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 13px', background: 'var(--emerald-dim)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <Award size={15} color="#10b981" />
                        <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>{sub.marks} / {activeAssign.maxMarks}</span>
                        {sub.feedback && <span style={{ fontSize: '12.5px', color: 'var(--text-2)', marginLeft: '8px' }}>"{sub.feedback}"</span>}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '12.5px', padding: '6px 14px', gap: '6px' }}
                        onClick={() => { setSelectedSub(sub); setMarksInput(sub.marks || 0); setFeedbackInput(sub.feedback || ''); }}
                      >
                        <CheckSquare size={13} />
                        {sub.marks != null ? 'Edit Grade' : 'Grade'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grade panel */}
            {selectedSub && (
              <div style={{ marginTop: '20px', padding: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-focus)', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '14px' }}>
                  Grading: {selectedSub.studentName}
                </h3>
                <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>
                      Marks (max {activeAssign.maxMarks})
                    </label>
                    <input type="number" min={0} max={activeAssign.maxMarks} required className="input-field" value={marksInput} onChange={e => setMarksInput(Number(e.target.value))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Feedback</label>
                    <textarea className="input-field" style={{ minHeight: '70px', resize: 'vertical' }} placeholder="Write evaluation feedback…" value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedSub(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Grade</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
