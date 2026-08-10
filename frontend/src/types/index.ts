export type UserRole = 'Admin' | 'Teacher' | 'Student';

export type AssignmentStatus = 'Draft' | 'Published';

export type SubmissionStatus = 'Submitted' | 'Reviewed' | 'Returned';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}

export interface ClassItem {
  id: string;
  name: string;
  description: string;
  studentCount: number;
  subjectCount: number;
  createdAt: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  classId: string;
  className: string;
  assignedTeachers: User[];
  createdAt: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  createdByTeacherId: string;
  teacherName: string;
  maxMarks: number;
  deadline: string;
  status: AssignmentStatus;
  allowLateSubmission: boolean;
  totalSubmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionItem {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  maxMarks: number;
  deadline: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  answerText: string;
  attachmentUrl?: string;
  status: SubmissionStatus;
  marks?: number;
  feedback?: string;
  submittedAt: string;
  updatedAt: string;
  isLate: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
