'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AssignmentItem, ClassItem, SubjectItem, SubmissionItem, AssignmentStatus } from '@/types';
import { Plus, Eye, Trash2, CheckSquare, FileCheck } from 'lucide-react';

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Assignment Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<AssignmentStatus>('Draft');
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [error, setError] = useState('');

  // Review Submissions State
  const [activeAssignment, setActiveAssignment] = useState<AssignmentItem | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [marksInput, setMarksInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const [assignRes, clsRes, subRes] = await Promise.all([
        api.get('/assignments?pageSize=100'),
        api.get('/classes'),
        api.get('/subjects')
      ]);
      setAssignments(assignRes.data?.items || []);
      setClasses(clsRes.data || []);
      setSubjects(subRes.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/assignments', {
        title,
        description,
        classId,
        subjectId,
        maxMarks,
        deadline: new Date(deadline).toISOString(),
        status,
        allowLateSubmission
      });
      setShowCreateModal(false);
      resetForm();
      fetchAssignments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setClassId('');
    setSubjectId('');
    setMaxMarks(100);
    setDeadline('');
    setStatus('Draft');
    setAllowLateSubmission(false);
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await api.patch(`/assignments/${id}/publish`);
      fetchAssignments();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      fetchAssignments();
    } catch {
      alert('Failed to delete assignment');
    }
  };

  const handleOpenReview = async (assignment: AssignmentItem) => {
    setActiveAssignment(assignment);
    try {
      const res = await api.get(`/assignments/${assignment.id}/submissions`);
      setSubmissions(res.data || []);
      setShowReviewModal(true);
    } catch {
      alert('Failed to load submissions');
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      await api.put(`/submissions/${selectedSubmission.id}/review`, {
        marks: marksInput,
        feedback: feedbackInput,
        status: 'Reviewed'
      });
      setSelectedSubmission(null);
      if (activeAssignment) {
        const res = await api.get(`/assignments/${activeAssignment.id}/submissions`);
        setSubmissions(res.data || []);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to review submission');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Assignments & Evaluation
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Create, publish, and evaluate student submission tasks
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-gold">
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <FileCheck className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-dim)' }}>
            <FileCheck className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No assignments created yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Class / Subject</th>
                <th>Deadline</th>
                <th>Max Marks</th>
                <th>Submissions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="font-semibold text-white">{a.title}</div>
                    <div className="text-xs text-slate-400 truncate max-w-xs">{a.description}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.className} • {a.subjectName}</td>
                  <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(a.deadline).toLocaleString()}</td>
                  <td className="font-bold text-amber-400">{a.maxMarks}</td>
                  <td className="font-bold text-purple-300">{a.totalSubmissions}</td>
                  <td>
                    <button
                      onClick={() => handleTogglePublish(a.id)}
                      className={`badge cursor-pointer ${
                        a.status === 'Published' ? 'badge-published' : 'badge-draft'
                      }`}
                      title="Click to toggle Draft / Published"
                    >
                      {a.status}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenReview(a)}
                        className="btn btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Submissions ({a.totalSubmissions})</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="btn-icon danger"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div
            className="w-full max-w-lg rounded-2xl p-7 space-y-5 max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(14, 10, 26, 0.98)',
              border: '1px solid rgba(139,92,246,0.35)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
          >
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Create New Assignment
            </h3>
            {error && <div className="p-3 bg-rose-500/20 text-rose-300 text-xs rounded-xl border border-rose-500/30">{error}</div>}

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Assignment title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Description / Instructions</label>
                <textarea
                  required
                  className="input-field min-h-[100px]"
                  placeholder="Detailed task description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Target Class</label>
                  <select
                    required
                    className="input-field"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Subject</label>
                  <select
                    required
                    className="input-field"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input-field"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Deadline Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="input-field"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Initial Status</label>
                  <select
                    className="input-field"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
                  >
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Published">Published (Visible to Students)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowLateSubmission}
                      onChange={(e) => setAllowLateSubmission(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    <span>Allow Late Submissions</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-sm">
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submissions Modal */}
      {showReviewModal && activeAssignment && (
        <div className="modal-overlay">
          <div
            className="w-full max-w-3xl rounded-2xl p-7 space-y-5 max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(14, 10, 26, 0.98)',
              border: '1px solid rgba(139,92,246,0.35)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{activeAssignment.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submissions List • Max Marks: {activeAssignment.maxMarks}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="btn btn-secondary text-xs"
              >
                Close
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No student submissions recorded yet.</div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white text-sm">{sub.studentName}</span>
                        <span className="text-xs text-slate-400 ml-2">({sub.studentEmail})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.isLate && <span className="badge badge-draft text-[10px]">Late</span>}
                        <span className={`badge badge-${sub.status.toLowerCase()}`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/70 rounded-lg text-slate-200 text-xs whitespace-pre-wrap">
                      {sub.answerText}
                    </div>

                    {sub.attachmentUrl && (
                      <div className="text-xs text-amber-400">
                        Attachment: <a href={sub.attachmentUrl} target="_blank" rel="noreferrer" className="underline">{sub.attachmentUrl}</a>
                      </div>
                    )}

                    {sub.marks !== null && sub.marks !== undefined && (
                      <div className="flex items-center gap-4 text-xs text-emerald-400 font-semibold pt-1">
                        <span>Marks: {sub.marks} / {activeAssignment.maxMarks}</span>
                        {sub.feedback && <span className="text-slate-300 font-normal">Feedback: "{sub.feedback}"</span>}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setMarksInput(sub.marks || 0);
                          setFeedbackInput(sub.feedback || '');
                        }}
                        className="btn btn-primary text-xs py-1.5 px-3"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{sub.marks !== null ? 'Re-grade / Edit' : 'Grade & Feedback'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-modal to grade a specific submission */}
            {selectedSubmission && (
              <div className="p-5 rounded-xl bg-purple-900/30 border border-purple-500/40 space-y-4 mt-4">
                <h4 className="font-bold text-sm text-amber-300">
                  Grade Submission for {selectedSubmission.studentName}
                </h4>
                <form onSubmit={handleSaveReview} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                      Marks (Max: {activeAssignment.maxMarks})
                    </label>
                    <input
                      type="number"
                      max={activeAssignment.maxMarks}
                      min="0"
                      required
                      className="input-field"
                      value={marksInput}
                      onChange={(e) => setMarksInput(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Teacher Feedback</label>
                    <textarea
                      className="input-field min-h-[70px]"
                      placeholder="Write evaluation comments..."
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="btn btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gold text-xs font-bold">
                      Submit Grade
                    </button>
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
