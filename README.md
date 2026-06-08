# AcademicOS – AI Powered Student Success & CGPA Optimization Platform

A production-ready SaaS platform for engineering students to optimize CGPA, plan studies with AI, track attendance, detect weaknesses, and become placement-ready.

![Tech Stack](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-8+-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## Features

### Academic Tools
- **CGPA Predictor** – Calculate required SGPA with semester-wise plans and difficulty scores
- **AI Study Planner** – OpenAI & Gemini powered daily/weekly/revision schedules
- **Weakness Detector** – Analyze marksheets to identify weak/strong subjects
- **Attendance Tracker** – Track per-subject attendance with 75% predictions
- **Backlog Recovery Planner** – Priority-based recovery roadmaps
- **Exam Score Predictor** – Predict end-semester marks from internals

### Career & AI
- **Placement Readiness Score** – Track DSA, projects, aptitude, communication
- **Topper Mode** – Gap analysis vs topper benchmarks
- **AI Notes Generator** – PDF/PPT to summaries, flashcards, quizzes

### Productivity & Gamification
- Pomodoro Timer, Focus Mode, Task Manager, Habit & Goal Tracker
- XP Points, Levels, Leaderboard, Daily/Weekly Challenges, Achievement Badges, Study Streaks

### Admin Panel
- User management, reports, analytics, notifications, AI credit management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS, Tailwind CSS, Chart.js, AOS, GSAP |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt, Email Verification |
| AI | OpenAI GPT-4o-mini, Google Gemini 1.5 Flash |
| Security | Helmet, Rate Limiting, XSS/Mongo Sanitize, Input Validation |

## Project Structure

```
academicos/
├── backend/
│   ├── config/          # Database & environment config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, security, validation, upload
│   ├── models/          # MongoDB schemas (16 models)
│   ├── routes/          # API route definitions
│   ├── services/        # AI service (OpenAI + Gemini)
│   ├── utils/           # Email, gamification, calculators
│   ├── uploads/         # File upload storage
│   └── server.js        # Express entry point
├── frontend/
│   ├── css/             # Global styles (dark/light, glassmorphism)
│   ├── js/              # API client, auth, dashboard, admin
│   ├── index.html       # Landing page
│   ├── login.html       # Authentication pages
│   ├── register.html
│   ├── forgot-password.html
│   ├── verify-email.html
│   ├── dashboard.html   # Student dashboard (10+ tools)
│   └── admin.html       # Admin panel
├── .env.example
├── DEPLOYMENT.md
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)

### Installation

```bash
# Clone and enter project
cd Project

# Copy environment file
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and API keys

# Install backend dependencies
cd backend
npm install

# Start server (serves API + frontend)
npm run dev
```

Open **http://localhost:5000** in your browser.

### Default Admin Account
Set in `.env`:
```
ADMIN_EMAIL=admin@academicos.app
ADMIN_PASSWORD=Admin@123456
```
Admin is auto-seeded on first startup.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login with JWT |
| POST | `/api/cgpa/predict` | CGPA prediction |
| POST | `/api/study-plans` | AI study plan generation |
| POST | `/api/weakness/analyze` | Weakness analysis |
| POST | `/api/attendance` | Track attendance |
| POST | `/api/backlogs` | Backlog recovery plan |
| PUT | `/api/placement` | Update placement progress |
| GET | `/api/analytics/dashboard` | Chart data |
| POST | `/api/notes/generate` | AI note generation |
| GET | `/api/gamification/leaderboard` | Leaderboard |
| GET | `/api/admin/users` | Admin: list users |

Full API documentation: all routes in `backend/routes/`.

## Database Schema

16 MongoDB collections:
- **Users** – Auth, profile, XP, levels, AI credits
- **StudyPlans** – AI-generated schedules
- **Attendance** – Per-subject tracking
- **CGPAData** – Predictions and history
- **Backlogs** – Recovery roadmaps
- **Notes** – Manual and AI-generated
- **PlacementProgress** – Career readiness
- **Notifications** – User and global alerts
- **Achievements** – Badge system
- **Challenges** – Daily/weekly challenges
- **Tasks, Habits, Goals, StudySessions** – Productivity
- **Reports** – User feedback for admin
- **WeaknessAnalysis** – Analysis results

## Security

- JWT authentication with HTTP-only cookies
- bcrypt password hashing (12 rounds)
- Rate limiting (auth: 20/15min, API: 200/15min, AI: 30/hr)
- Helmet security headers
- MongoDB injection & XSS protection
- Input validation with express-validator
- Email verification & password reset tokens

## Environment Variables

See `.env.example` for all required variables:
- `MONGODB_URI`, `JWT_SECRET`
- `OPENAI_API_KEY`, `GEMINI_API_KEY` (optional – fallback logic included)
- `SMTP_*` for email (optional – mock mode without SMTP)

## License

MIT License – Built for educational and commercial use.
