# # ORP — Assignment & Submission Management System

A role-based web application for schools and colleges designed for evaluating student understanding, managing courses, creating assignments, submitting work, and providing structured marks and teacher feedback.

Developed for **OnnoRokom Projukti Limited** recruitment project.

---

## 🌟 Main Features

- 🔐 **JWT Role-Based Authentication & Authorization** (Admin, Teacher, Student)
- 🏫 **Class & Subject Administration**: Map classes, assign subjects, and enroll students & teachers.
- 📝 **Assignment Lifecycle Management**: Create assignments with title, description, max marks, deadline, and draft/published status toggle.
- 📤 **Submission Workflow**: Enforce deadline checks, single submission rules, late submission flags, and pre-deadline updates.
- 🎯 **Review & Grading**: Teachers evaluate submissions, assign marks (validated against max marks), and write feedback comments.
- 📊 **Role-Specific Dashboards**: Tailored real-time metrics and quick actions for each user role.
- 🛡️ **Comprehensive API Security & Input Validation**: Validation filters, global error handling, and Swagger documentation.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14+ (App Router), React 19, TypeScript, Vanilla CSS Design System, Axios, Lucide Icons |
| **Backend** | ASP.NET Core Web API (.NET 10), C#, Entity Framework Core, JWT Bearer Auth, BCrypt Password Hashing, Swashbuckle Swagger |
| **Database** | PostgreSQL (supported with automatic EF Core Migrations and In-Memory fallback for testing) |
| **Testing** | xUnit, Moq, EF Core InMemory |

---

## 🔑 Demo Credentials

| Role | Email | Password | Scope / Permissions |
|---|---|---|---|
| **Admin** | `admin@school.com` | `Admin@123` | Full access: user management, class creation, subject mapping, student/teacher enrollment |
| **Teacher** | `teacher@school.com` | `Teacher@123` | Create & publish assignments, view class submissions, grade & provide feedback |
| **Student** | `student@school.com` | `Student@123` | View class assignments, submit answers before deadline, view marks & feedback |

---

## 📁 Project Structure

```
Onno Rokom Projukti/
├── backend/
│   ├── AssignmentMS.API/             # Web API Controllers, Auth & Middleware
│   ├── AssignmentMS.Core/            # Domain Entities, DTOs, Enums, Interfaces
│   ├── AssignmentMS.Infrastructure/  # EF Core DbContext, Migrations, Repositories/Services
│   ├── AssignmentMS.Tests/           # xUnit Unit Tests
│   └── AssignmentMS.slnx             # Solution File
├── frontend/
│   ├── src/
│   │   ├── app/                      # Next.js App Router Pages (Login, Dashboard, Admin, Teacher, Student)
│   │   ├── components/               # Navbar, Sidebar, Reusable UI
│   │   ├── lib/                      # Axios client & AuthContext
│   │   └── types/                    # TypeScript interfaces
│   └── package.json
├── .env.example                      # Environment variables template
└── README.md                         # Project documentation
```

---

## 🚀 Local Setup & Recruiter Evaluation Instructions

### 🐳 Option A: One-Command Docker Setup (Recommended for Evaluators)

When cloning the repository, you can launch the **entire stack** (PostgreSQL Database, ASP.NET Core Web API, and Next.js Frontend) using a single command:

```bash
docker compose up --build
```

- **Frontend App**: Open [http://localhost:3000](http://localhost:3000)
- **Backend Swagger API Docs**: Open [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **PostgreSQL Database**: Accessible on `localhost:5432` (`assignment_ms` database)

---

### 📦 Option B: Docker PostgreSQL Database + Local Code Execution

If you prefer running the code locally:

#### 1. Start PostgreSQL Container
```bash
docker compose up -d postgres
```

#### 2. Run Backend API
```bash
cd backend/AssignmentMS.API
dotnet run
```
> The API auto-detects PostgreSQL on port 5432, executes migrations, and seeds demo accounts (`admin@school.com`, `teacher@school.com`, `student@school.com`).

#### 3. Run Frontend
```bash
cd frontend
npm run dev
```

---

### 🧪 Option C: Running Unit Tests

```bash
cd backend
dotnet test
```

---

## 📐 Design Assumptions & Decision Rationale

1. **Deterministic Pre-Seeded Users**: Pre-hashed demo credentials are created on database setup to enable instant testing without manual registration.
2. **Submission Constraints**:
   - Each student can make one submission per assignment.
   - Students can update their submission before the deadline, provided the teacher has not yet completed evaluation (`Reviewed` status).
   - Submissions after the deadline are rejected unless `AllowLateSubmission` is enabled by the teacher.
3. **Marks Validation**: Assigned marks cannot exceed `MaxMarks`.

---

## 📄 License & Attribution

© 2026 OnnoRokom Projukti Limited. Built for Assistant Software Engineer recruitment assessment.
