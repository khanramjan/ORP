'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SubmissionItem } from '@/types';
import { Clock, MessageSquare, Award, UploadCloud } from 'lucide-react';

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/submissions/my');
        setSubmissions(res.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          My Submissions & Feedback
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Track evaluated submissions, marks, and teacher remarks
        </p>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <UploadCloud className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Loading your submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <UploadCloud className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">You have not submitted any assignments yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl space-y-4"
                style={{
                  background: 'rgba(139,92,246,0.06)',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{sub.assignmentTitle}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Submitted on: {new Date(sub.submittedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.isLate && <span className="badge badge-draft text-[10px]">Submitted Late</span>}
                    <span className={`badge badge-${sub.status.toLowerCase()}`}>
                      {sub.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-xl text-slate-200 text-xs whitespace-pre-wrap leading-relaxed">
                  {sub.answerText}
                </div>

                {sub.marks !== null && sub.marks !== undefined ? (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Award className="w-4 h-4" />
                      <span>Marks Awarded: {sub.marks} / {sub.maxMarks}</span>
                    </div>

                    {sub.feedback && (
                      <div className="flex items-start gap-2 text-xs text-slate-300">
                        <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-200">Teacher Feedback:</span> {sub.feedback}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting teacher evaluation</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
