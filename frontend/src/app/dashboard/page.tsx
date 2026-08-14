'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ClassItem, SubjectItem, AssignmentItem, SubmissionItem } from '@/types';
import {
  FolderKanban, BookMarked, FileCheck,
  CheckCircle2, Clock, Plus, ArrowUpRight, Award, Users
} from 'lucide-react';
import Link from 'next/link';

const StatCard = ({
  label, value, sub, color, icon,
}: {
  label: string; value: React.ReactNode; sub?: string;
  color: string; icon: React.ReactNode;
}) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px 22px',
    display: 'flex', flexDirection: 'column', gap: '12px',
    transition: 'border-color 0.15s',
  }}
  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'}
  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px',
        background: `${color}15`,
        border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
    </div>
    <div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '5px' }}>{sub}</div>}
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [classes,     setClasses]     = useState<ClassItem[]>([]);
  const [subjects,    setSubjects]    = useState<SubjectItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        if (user.role === 'Admin' || user.role === 'Teacher') {
          const [c, s, a] = await Promise.all([
            api.get('/classes'), api.get('/subjects'), api.get('/assignments?pageSize=50'),
          ]);
          setClasses(c.data || []);
          setSubjects(s.data || []);
          setAssignments(a.data?.items || []);
        } else if (user.role === 'Student') {
          const [a, s] = await Promise.all([
            api.get('/students/assignments'), api.get('/submissions/my'),
          ]);
          setAssignments(a.data || []);
          setSubmissions(s.data || []);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const renderStats = () => {
    if (user.role === 'Admin') return (
      <>
        <StatCard label="Classes"     value={classes.length}     sub="Total academic classes"   color="#6366f1" icon={<FolderKanban size={16} />} />
        <StatCard label="Subjects"    value={subjects.length}    sub="Mapped subjects"          color="#22d3ee" icon={<BookMarked size={16} />} />
        <StatCard label="Assignments" value={assignments.length} sub="All coursework"           color="#f59e0b" icon={<FileCheck size={16} />} />
        <StatCard label="Role"        value="Admin"              sub="Full system access"       color="#fb7185" icon={<Users size={16} />} />
      </>
    );
    if (user.role === 'Teacher') return (
      <>
        <StatCard label="Total"     value={assignments.length}                                   sub="Assignments created"    color="#6366f1" icon={<FileCheck size={16} />} />
        <StatCard label="Published" value={assignments.filter(a => a.status === 'Published').length} sub="Visible to students"    color="#10b981" icon={<CheckCircle2 size={16} />} />
        <StatCard label="Drafts"    value={assignments.filter(a => a.status === 'Draft').length}     sub="Pending publish"       color="#f59e0b" icon={<Clock size={16} />} />
        <StatCard label="Classes"   value={classes.length}                                       sub="Sections assigned"     color="#22d3ee" icon={<FolderKanban size={16} />} />
      </>
    );
    return (
      <>
        <StatCard label="Assigned"  value={assignments.length}                                       sub="Total assignments"      color="#6366f1" icon={<FileCheck size={16} />} />
        <StatCard label="Submitted" value={submissions.length}                                       sub="Completed"              color="#10b981" icon={<CheckCircle2 size={16} />} />
        <StatCard label="Pending"   value={submissions.filter(s => s.status === 'Submitted').length} sub="Awaiting review"        color="#f59e0b" icon={<Clock size={16} />} />
        <StatCard label="Graded"    value={submissions.filter(s => s.status === 'Reviewed').length}  sub="Evaluated & marked"    color="#22d3ee" icon={<Award size={16} />} />
      </>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-3)', marginBottom: '4px' }}>{today}</p>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
            Welcome back, {user.fullName.split(' ')[0]}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-3)', marginTop: '6px' }}>
            {user.role === 'Admin'   && 'Manage your institution — users, classes, and subjects.'}
            {user.role === 'Teacher' && 'Create assignments, publish tasks, and grade submissions.'}
            {user.role === 'Student' && 'View assigned coursework and track your submission status.'}
          </p>
        </div>
        {user.role === 'Teacher' && (
          <Link href="/teacher/assignments">
            <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', marginTop: '4px' }}>
              <Plus size={14} /> New Assignment
            </button>
          </Link>
        )}
        {user.role === 'Admin' && (
          <Link href="/admin/users">
            <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', marginTop: '4px' }}>
              <Users size={14} /> Manage Users
            </button>
          </Link>
        )}
        {user.role === 'Student' && (
          <Link href="/student/assignments">
            <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', marginTop: '4px' }}>
              <FileCheck size={14} /> View Tasks
            </button>
          </Link>
        )}
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              height: '110px', borderRadius: '12px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              animation: 'pulse 1.5s infinite',
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {renderStats()}
        </div>
      )}

      {/* Recent assignments */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)' }}>Recent Assignments</span>
          <Link
            href={user.role === 'Student' ? '/student/assignments' : '/teacher/assignments'}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--indigo-light)', textDecoration: 'none', fontWeight: 500 }}
          >
            View all <ArrowUpRight size={13} />
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13.5px' }}>
            No assignments yet.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Class / Subject</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.slice(0, 6).map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.title}</td>
                  <td style={{ color: 'var(--text-3)' }}>{a.className} · {a.subjectName}</td>
                  <td style={{ color: 'var(--text-3)', fontSize: '12.5px' }}>
                    {new Date(a.deadline).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge badge-${a.status === 'Published' ? 'published' : 'draft'}`}>
                      <span className="badge-dot" />
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
