'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AssignmentItem, SubmissionItem } from '@/types';
import { Send, Clock, FileCheck } from 'lucide-react';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<SubmissionItem | null>(null);

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

  const handleOpenSubmitModal = async (a: AssignmentItem) => {
    setSelectedAssignment(a);
    setError('');
    try {
      const res = await api.get(`/students/assignments/${a.id}`);
      if (res.data?.submission) {
        setExistingSubmission(res.data.submission);
        setAnswerText(res.data.submission.answerText);
        setAttachmentUrl(res.data.submission.attachmentUrl || '');
      } else {
        setExistingSubmission(null);
        setAnswerText('');
        setAttachmentUrl('');
      }
    } catch { /* silent */ }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setError('');
    setSubmitting(true);

    try {
      if (existingSubmission) {
        await api.put(`/submissions/${existingSubmission.id}`, {
          assignmentId: selectedAssignment.id,
          answerText,
          attachmentUrl
        });
      } else {
        await api.post('/submissions', {
          assignmentId: selectedAssignment.id,
          answerText,
          attachmentUrl
        });
      }
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Class Assignments
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Active tasks assigned to your enrolled class
        </p>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <FileCheck className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <FileCheck className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No published assignments for your class.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {assignments.map((a) => {
              const isPastDeadline = new Date() > new Date(a.deadline);
              return (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl flex flex-col justify-between space-y-4"
                  style={{
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.2)',
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{a.title}</h3>
                      <span className="badge badge-teacher text-[10px]">{a.subjectName}</span>
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{a.description}</p>
                  </div>

                  <div className="pt-3 space-y-3" style={{ borderTop: '1px solid rgba(139,92,246,0.12)' }}>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline: {new Date(a.deadline).toLocaleString()}</span>
                      </div>
                      <span className="font-bold text-white">Max Marks: {a.maxMarks}</span>
                    </div>

                    <button
                      onClick={() => handleOpenSubmitModal(a)}
                      className="btn btn-primary w-full text-xs py-2.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isPastDeadline ? 'View Submission' : 'Submit / Edit Answer'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="modal-overlay">
          <div
            className="w-full max-w-lg rounded-2xl p-7 space-y-5"
            style={{
              background: 'rgba(14, 10, 26, 0.98)',
              border: '1px solid rgba(139,92,246,0.35)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{selectedAssignment.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Subject: {selectedAssignment.subjectName}</p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="btn btn-secondary text-xs"
              >
                Close
              </button>
            </div>

            {error && <div className="p-3 bg-rose-500/20 text-rose-300 text-xs rounded-xl border border-rose-500/30">{error}</div>}

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Your Answer Text</label>
                <textarea
                  required
                  className="input-field min-h-[140px]"
                  placeholder="Type your solution / answers here..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Attachment Link (Optional)</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://drive.google.com/your-file-link"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="btn btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary text-sm"
                >
                  {submitting ? 'Submitting...' : existingSubmission ? 'Update Submission' : 'Submit Answer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
