# 🎓 EduAssign — Academic Assignment & Submission Management System

> A role-based academic platform built for **OnnoRokom Projukti Limited** recruitment assessment. Enables institutions to manage users, classes, and subjects, create and publish assignments, submit coursework, and conduct teacher evaluations with structured marks and remarks.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT Authentication**: Secure role-based authorization for **Admin**, **Teacher**, and **Student** roles.
- **BCrypt Password Hashing**: Passwords stored securely using industry-standard salted hashes.
- **Demo Quick Access**: One-click quick fill login cards on the login portal for instant evaluator testing.

### 🏫 Administrative Workspaces (Admin)
- **User Management**: Filter by role, create new accounts, and delete users.
- **Class Management**: Create class sections, view student/subject metrics, and enroll students.
- **Subject Management**: Map subjects to classes and assign dedicated teachers.

### 📝 Coursework & Evaluation Workspaces (Teacher)
- **Assignment Lifecycle**: Create assignments with title, instructions, target class, subject, max marks, deadline, and late submission flags.
- **Publish / Draft Toggle**: Seamless single-click status toggling (`Draft` vs `Published`).
- **Review & Grading Drawer**: View student answers, check attachment links, assign numerical marks (validated against max marks), and write faculty remarks.

### 🎓 Student Learning Portal (Student)
- **Coursework Feed**: View active assignments with color-coded deadline urgency and max mark indicators.
- **Submission Workflow**: Enforce deadline checks, single submission rules, late submission detection, and pre-evaluation updates.
- **Feedback & Grade Cards**: Track submission statuses, percentage scores, and teacher remarks.

---

## 🛠️ Technology Stack

| Layer | Technologies & Frameworks |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Inter & JetBrains Mono Fonts, Lucide Icons, Vanilla CSS Tokens |
| **Backend** | ASP.NET Core Web API (.NET 10), C#, Entity Framework Core, JWT Bearer Auth, BCrypt.Net, Swashbuckle Swagger |
| **Database** | PostgreSQL 16 (with automatic EF Core Migrations and In-Memory fallback for standalone evaluation) |
| **Testing** | xUnit, Moq, EF Core In-Memory Test Provider |
| **Containerization** | Docker, Docker Compose |

---

## 🔑 Pre-Seeded Evaluation Accounts

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Admin** | `admin@school.com` | `Admin@123` | Full access: User management, class creation, subject mapping, student & teacher enrollments |
| **Teacher** | `teacher@school.com` | `Teacher@123` | Create & publish assignments, view class submissions, grade & provide remarks |
| **Student** | `student@school.com` | `Student@123` | View assigned tasks, submit answers before deadline, view marks & feedback |

---

## 📁 Repository Architecture

```text
Onno Rokom Projukti/
├── backend/
│   ├── AssignmentMS.API/             # Controllers, Middleware, JWT Configuration, Program.cs
│   ├── AssignmentMS.Core/            # Entities (User, Class, Subject, Assignment, Submission), DTOs, Interfaces
│   ├── AssignmentMS.Infrastructure/  # DbContext, EF Migrations, Services (Auth, User, Class, Subject, Assignment, Submission)
│   ├── AssignmentMS.Tests/           # xUnit Automated Unit Test Suite
│   └── AssignmentMS.slnx             # C# Solution Manifest
├── frontend/
│   ├── src/
│   │   ├── app/                      # Next.js App Router (Login, Dashboard, Admin, Teacher, Student)
│   │   ├── components/               # Navbar, Sidebar, Reusable UI Components
│   │   ├── lib/                      # Axios API Client & AuthContext Provider
│   │   └── types/                    # TypeScript Data Contracts & Interfaces
│   ├── public/                       # Static Assets & Icons
│   └── package.json
├── docker-compose.yml                # Multi-container orchestration (DB, API, Frontend)
├── README.md                         # Documentation
└── .env.example                      # Environment variables template
```

---

## 🚀 Quick Start Guide

### Option 1: One-Command Docker Compose (Recommended)

Launch the entire stack (Database, API, and Frontend) in containerized isolation:

```bash
docker compose up --build
```

- 🌐 **Frontend App**: [http://localhost:3000](http://localhost:3000)
- 📚 **Swagger API Docs**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
- 🗄️ **PostgreSQL DB**: `localhost:5432` (`assignment_ms` database)

---

### Option 2: Local Code Execution

#### 1. Start Database Container
```bash
docker compose up -d db
```

#### 2. Run Backend API (.NET 10)
```bash
cd backend/AssignmentMS.API
dotnet run
```
> *Note: If PostgreSQL is not running locally on port 5432, the API automatically falls back to an in-memory database with pre-seeded test data.*

#### 3. Run Frontend (Next.js 15)
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Unit Testing

Run the automated xUnit test suite covering core services and domain rules:

```bash
cd backend
dotnet test
```

---

## 📄 License & Credits

Developed for **OnnoRokom Projukti Limited** recruitment evaluation.  
© 2026 EduAssign. All rights reserved.
