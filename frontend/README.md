# ExamPro Frontend Client

Modern, responsive web frontend for the **ExamPro Online Examination & Automated Assessment System**, built with React, Vite, JavaScript, and Tailwind CSS.

---

## Features

- **Public Landing Page**: Modern hero section, real-time backend health check, platform highlights, and workflow guide.
- **Authentication**:
  - Registration form complying with `POST /api/auth/register` (unconditionally assigns `STUDENT`).
  - Login form using `POST /api/auth/login` (returns JWT token and role).
  - Secure local JWT session persistence with expiration handling and authorization headers.
  - Quick-fill buttons for demo Admin and Student accounts.
- **Student Dashboard & Examination**:
  - Browse available examinations with duration, questions count, and passing threshold.
  - Active examination session with real-time countdown timer, auto-saving of answers (`PUT /api/attempts/{id}/answers`), and question palette navigation.
  - Confirmation modal before submission (`POST /api/attempts/{id}/submit`).
  - Detailed scorecard with percentage, passing status, and score metrics.
- **Admin Control Center**:
  - Role-protected portal (`/admin/dashboard`).
  - Manage Examinations: create exams with custom durations, passing percentages, and availability windows.
  - Question Bank: create multi-choice questions with weighted marks, difficulty (`EASY`, `MEDIUM`, `HARD`), and single correct option validation.
  - Subject Management: organize questions by academic discipline.
  - Assign Questions: associate questions from the bank directly to exams.
  - Results Inspection: live monitoring of all student attempts across the system.

---

## Project Structure

```text
frontend/
├── src/
│   ├── api/
│   │   └── client.js           # Unified fetch API client with JWT bearer interceptor
│   ├── components/
│   │   ├── Alert.jsx           # Reusable feedback banner (info, error, success, warning)
│   │   ├── CountdownTimer.jsx  # Real-time exam countdown timer with urgency alerts
│   │   ├── Footer.jsx          # Site-wide footer with API documentation links
│   │   ├── LoadingSpinner.jsx  # Accessible loading indicator
│   │   ├── Modal.jsx           # Accessible dialog modal
│   │   ├── Navbar.jsx          # Responsive navigation bar with user badge and role pill
│   │   └── ProtectedRoute.jsx  # Route guard by authentication and role (STUDENT / ADMIN)
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context provider (login, register, logout)
│   ├── pages/
│   │   ├── AdminDashboard.jsx  # Admin portal for exams, questions, subjects & results
│   │   ├── ExamsList.jsx       # Public & student catalog of available assessments
│   │   ├── ExamTaking.jsx      # Timed interactive exam session
│   │   ├── Home.jsx            # Public landing page
│   │   ├── Login.jsx           # Sign in page
│   │   ├── NotFound.jsx        # 404 handler
│   │   ├── Register.jsx        # Student registration page
│   │   ├── ResultDetail.jsx    # Individual assessment scorecard
│   │   └── StudentDashboard.jsx# Student assessment history and metrics
│   ├── App.jsx                 # Client-side router configuration
│   ├── index.css               # Tailwind CSS directives
│   └── main.jsx                # Application root mount
├── .env                        # Local environment variables
├── .env.example                # Example configuration
├── index.html                  # HTML template
├── package.json                # Project dependencies and build scripts
├── postcss.config.js           # PostCSS Tailwind plugins
├── tailwind.config.js          # Tailwind CSS theme configuration
└── vite.config.js              # Vite bundler & dev proxy configuration
```

---

## Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v26)
- ExamPro Spring Boot Backend running on `http://localhost:8081`

### 1. Installation
Navigate into the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

### 2. Configure Environment
Verify `.env` has the correct backend URL (defaults to port 8081):
```env
VITE_API_BASE_URL=http://localhost:8081
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```
Build assets will be generated in `frontend/dist/`.

---

## Demo Credentials

You can use the built-in quick-fill buttons on the Login page or use the credentials below:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `ExamProAdmin2026!` | `/admin/dashboard` & all exams |
| **Student** | `student_test_1@example.com` | `Password123!` | `/student/dashboard` & take exams |

---

## Backend API Endpoints Used

| Module | Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Register student |
| **Auth** | `POST` | `/api/auth/login` | Public | User login, returns JWT |
| **Exams** | `GET` | `/api/exams` | Authenticated | Browse available exams |
| **Exams** | `GET` | `/api/exams/{id}` | Authenticated | Single exam details |
| **Exams** | `POST` | `/api/admin/exams` | Admin | Create new exam |
| **Exams** | `PUT` | `/api/admin/exams/{id}` | Admin | Update exam |
| **Exams** | `DELETE` | `/api/admin/exams/{id}` | Admin | Delete exam |
| **Exams** | `POST` | `/api/admin/exams/{id}/questions` | Admin | Assign questions to exam |
| **Subjects** | `GET` | `/api/subjects` | Authenticated | List all subjects |
| **Subjects** | `POST` | `/api/admin/subjects` | Admin | Create subject |
| **Subjects** | `DELETE` | `/api/admin/subjects/{id}` | Admin | Delete subject |
| **Questions** | `GET` | `/api/questions` | Authenticated | List question bank |
| **Questions** | `POST` | `/api/admin/questions` | Admin | Add question with options |
| **Questions** | `DELETE` | `/api/admin/questions/{id}` | Admin | Delete question |
| **Attempts** | `POST` | `/api/exams/{id}/attempts` | Student | Start new exam attempt |
| **Attempts** | `PUT` | `/api/attempts/{id}/answers` | Student | Auto-save answers |
| **Attempts** | `POST` | `/api/attempts/{id}/submit` | Student | Submit exam for grading |
| **Results** | `GET` | `/api/results/my` | Student | View student history |
| **Results** | `GET` | `/api/results/{id}` | Student/Admin | View single scorecard |
| **Results** | `GET` | `/api/admin/results` | Admin | View all student submissions |
| **Status** | `GET` | `/api/status` | Public | Health & metadata check |

