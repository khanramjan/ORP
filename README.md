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

## 🚀 Easy Local Setup Instructions

### Prerequisites
- [.NET 9 / 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js v18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) (optional - auto-falls back to EF Core In-Memory database if PostgreSQL service is unavailable)

---

### 1. Database Setup

Create a PostgreSQL database named `assignment_ms`:
```sql
CREATE DATABASE assignment_ms;
```

Optionally configure your database connection string in `backend/AssignmentMS.API/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=assignment_ms;Username=postgres;Password=postgres"
}
```

> **Note:** The backend API will automatically run migrations and seed sample demo data (`admin@school.com`, `teacher@school.com`, `student@school.com`, sample classes & subjects) on application launch.

---

### 2. Running the Backend API

```bash
# Navigate to backend directory
cd backend

# Build solution
dotnet build

# Run API (Listens on http://localhost:5000)
dotnet run --project AssignmentMS.API/AssignmentMS.API.csproj --urls=http://localhost:5000
```

- **Swagger API Docs**: Open [http://localhost:5000/swagger](http://localhost:5000/swagger) in your browser.

---

### 3. Running the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (Listens on http://localhost:3000)
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000) in your browser and log in using the demo credentials.

---

### 4. Running Unit Tests

```bash
# Run all backend xUnit tests
cd backend
dotnet test AssignmentMS.Tests/AssignmentMS.Tests.csproj
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
