'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ClassItem, SubjectItem, AssignmentItem, SubmissionItem } from '@/types';
import { 
  FolderKanban, 
  BookMarked, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowUpRight,
  Award,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (user.role === 'Admin' || user.role === 'Teacher') {
          const [clsRes, subRes, assignRes] = await Promise.all([
            api.get('/classes'),
            api.get('/subjects'),
            api.get('/assignments?pageSize=50')
          ]);
          setClasses(clsRes.data || []);
          setSubjects(subRes.data || []);
          setAssignments(assignRes.data?.items || []);
        } else if (user.role === 'Student') {
          const [assignRes, subRes] = await Promise.all([
            api.get('/students/assignments'),
            api.get('/submissions/my')
          ]);
          setAssignments(assignRes.data || []);
          setSubmissions(subRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {user.role === 'Admin' && 'System overview and administrative controls.'}
            {user.role === 'Teacher' && 'Track your course assignments and student evaluations.'}
            {user.role === 'Student' && 'View your active assignments and submission status.'}
          </p>
        </div>
        {user.role === 'Teacher' && (
          <Link href="/teacher/assignments" className="btn btn-primary text-xs">
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </Link>
        )}
      </div>

      {/* Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-900 border border-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.role === 'Admin' && (
            <>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Classes</span>
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">{classes.length}</div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Subjects</span>
                  <BookMarked className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">{subjects.length}</div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Assignments</span>
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">{assignments.length}</div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Account Role</span>
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-lg font-semibold text-zinc-100 mt-2">Administrator</div>
              </div>
            </>
          )}

          {user.role === 'Teacher' && (
            <>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Assignments</span>
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">{assignments.length}</div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Published</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">
                  {assignments.filter(a => a.status === 'Published').length}
                </div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Drafts</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">
                  {assignments.filter(a => a.status === 'Draft').length}
                </div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Classes Taught</span>
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">{classes.length}</div>
              </div>
            </>
          )}

          {user.role === 'Student' && (
            <>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Assigned Tasks</span>
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">{assignments.length}</div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Submitted</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">{submissions.length}</div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Pending Review</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">
                  {submissions.filter(s => s.status === 'Submitted').length}
                </div>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">Graded</span>
                  <Award className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-semibold text-zinc-100 mt-2">
                  {submissions.filter(s => s.status === 'Reviewed').length}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent Assignments Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Recent Assignments</h2>
          <Link 
            href={user.role === 'Student' ? '/student/assignments' : '/teacher/assignments'}
            className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 font-medium"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No assignments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {assignments.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-zinc-100">{a.title}</td>
                    <td className="text-zinc-400">{a.className} • {a.subjectName}</td>
                    <td className="text-zinc-400 text-xs">{new Date(a.deadline).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${a.status === 'Published' ? 'badge-published' : 'badge-draft'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
