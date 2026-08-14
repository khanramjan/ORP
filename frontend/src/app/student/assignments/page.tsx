'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AssignmentItem, SubmissionItem } from '@/types';
import { Clock, Send, X } from 'lucide-react';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AssignmentItem | null>(null);
  const [existing, setExisting] = useState<SubmissionItem | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students/assignments');
      setAssignments(res.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleOpen = async (a: AssignmentItem) => {
    setSelected(a); setError('');
    try {
      const res = await api.get(`/students/assignments/${a.id}`);
      if (res.data?.submission) {
        setExisting(res.data.submission);
        setAnswerText(res.data.submission.answerText);
        setAttachmentUrl(res.data.submission.attachmentUrl || '');
      } else {
        setExisting(null); setAnswerText(''); setAttachmentUrl('');
      }
    } catch { /* silent */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError(''); setSubmitting(true);
    try {
      if (existing) {
        await api.put(`/submissions/${existing.id}`, { assignmentId: selected.id, answerText, attachmentUrl });
      } else {
        await api.post('/submissions', { assignmentId: selected.id, answerText, attachmentUrl });
      }
      setSelected(null); fetchAssignments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
          My Assignments
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
          Active tasks assigned to your class
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
      ) : assignments.length === 0 ? (
        <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13.5px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          No published assignments for your class yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {assignments.map(a => {
            const isPast = new Date() > new Date(a.deadline);
            return (
              <div key={a.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '14px',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3 }}>{a.title}</h3>
                  <span className="badge badge-teacher" style={{ fontSize: '11px', flexShrink: 0 }}>
                    <span className="badge-dot" />{a.subjectName}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.6 }}>
                  {a.description}
                </p>

                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isPast ? '#fb7185' : 'var(--amber)', fontWeight: 500 }}>
                      <Clock size={12} />
                      {new Date(a.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ color: 'var(--text-3)' }}>Max: <strong style={{ color: 'var(--text-1)' }}>{a.maxMarks}</strong> pts</span>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '9px' }}
                    onClick={() => handleOpen(a)}
                  >
                    <Send size={13} />
                    {isPast ? 'View / Submit' : existing ? 'Edit Submission' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '520px', padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>{selected.title}</h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-3)', marginTop: '3px' }}>
                  Subject: {selected.subjectName}
                </p>
              </div>
              <button className="btn-icon" onClick={() => setSelected(null)}><X size={15} /></button>
            </div>

            {error && <div style={{ padding: '9px 13px', background: 'var(--rose-dim)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '7px', color: '#fb7185', fontSize: '13px', marginBottom: '18px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Your Answer</label>
                <textarea required className="input-field" style={{ minHeight: '140px', resize: 'vertical' }} placeholder="Write your complete answer here…" value={answerText} onChange={e => setAnswerText(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '6px' }}>Attachment URL <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                <input type="url" className="input-field" placeholder="https://drive.google.com/…" value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : existing ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
