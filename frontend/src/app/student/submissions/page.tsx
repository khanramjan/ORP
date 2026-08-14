'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SubmissionItem } from '@/types';
import { Clock, Award, MessageSquare, UploadCloud } from 'lucide-react';

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/submissions/my');
        setSubmissions(res.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
          My Submissions
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '4px' }}>
          Track evaluation status, marks, and teacher feedback
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>
          <UploadCloud size={28} style={{ marginBottom: '8px', opacity: 0.3 }} />
          <p>Loading…</p>
        </div>
      ) : submissions.length === 0 ? (
        <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-3)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <UploadCloud size={28} style={{ marginBottom: '10px', opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
          <p style={{ fontSize: '13.5px' }}>No submissions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {submissions.map(sub => (
            <div key={sub.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '14px',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-1)' }}>{sub.assignmentTitle}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '3px' }}>
                    Submitted {new Date(sub.submittedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  {sub.isLate && (
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '5px',
                      background: 'var(--rose-dim)', color: '#fb7185',
                      border: '1px solid rgba(244,63,94,0.2)', fontWeight: 600,
                    }}>Late</span>
                  )}
                  <span className={`badge badge-${sub.status.toLowerCase()}`}>
                    <span className="badge-dot" />{sub.status}
                  </span>
                </div>
              </div>

              {/* Answer */}
              <div style={{
                padding: '14px', background: 'var(--bg-elevated)',
                borderRadius: '8px', border: '1px solid var(--border)',
                fontSize: '13.5px', color: 'var(--text-2)',
                whiteSpace: 'pre-wrap', lineHeight: 1.65,
                maxHeight: '180px', overflowY: 'auto',
              }}>
                {sub.answerText}
              </div>

              {/* Grade/feedback or pending */}
              {sub.marks != null ? (
                <div style={{
                  padding: '14px 16px', borderRadius: '10px',
                  background: 'var(--emerald-dim)', border: '1px solid rgba(16,185,129,0.2)',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '14px' }}>
                      <Award size={16} />
                      <span>{sub.marks} / {sub.maxMarks} marks</span>
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: 700, padding: '3px 10px',
                      borderRadius: '20px',
                      background: 'rgba(16,185,129,0.2)', color: '#10b981',
                    }}>
                      {Math.round((sub.marks / sub.maxMarks) * 100)}%
                    </span>
                  </div>
                  {sub.feedback && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--text-2)' }}>
                      <MessageSquare size={14} style={{ color: 'var(--indigo-light)', flexShrink: 0, marginTop: '2px' }} />
                      <span><strong style={{ color: 'var(--text-1)' }}>Teacher:</strong> {sub.feedback}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '13px', color: 'var(--amber)', fontWeight: 500,
                  padding: '10px 14px', borderRadius: '8px',
                  background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)',
                }}>
                  <Clock size={14} />
                  Awaiting teacher evaluation
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
