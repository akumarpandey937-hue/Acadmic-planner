# AcademicOS – AI Powered Student Success & CGPA Optimization Platform

A production-ready SaaS platform for engineering students to optimize CGPA, plan studies with AI, track attendance, and become placement-ready.

![Tech Stack](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-8+-green)

## Live Demo (GitHub Pages)

After pushing to GitHub and enabling Pages, your site will be live at:

```
https://<your-username>.github.io/<repo-name>/
```

**Landing page, login UI, and demos work on GitHub Pages.** Auth and dashboard features need the backend deployed separately — set `DEPLOYED_API_URL` in `js/config.js`.

---

## Project Structure (GitHub-ready)

```
Project/
├── css/
│   └── styles.css          # Global styles (dark/light, glassmorphism)
├── js/
│   ├── config.js           # API URL config (set for GitHub Pages)
│   ├── api.js              # REST client
│   ├── auth.js             # Authentication
│   ├── dashboard.js        # Student dashboard logic
│   ├── admin.js            # Admin panel logic
│   ├── landing.js          # Landing page animations
│   ├── theme.js            # Dark/light mode
│   └── utils.js            # Helpers
├── index.html              # Landing page
├── login.html
├── register.html
├── forgot-password.html
├── verify-email.html
├── dashboard.html          # Student dashboard
├── admin.html              # Admin panel
├── backend/                # Node.js API (deploy separately)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── .nojekyll               # Required for GitHub Pages
├── .env.example
├── DEPLOYMENT.md
└── README.md
```

---

## Push to GitHub

```bash
cd Project
git init
git add .
git commit -m "Initial commit: AcademicOS"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Enable GitHub Pages

1. Open your repo on GitHub → **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` → **/ (root)** → Save
4. Wait 1–2 minutes — site goes live at `https://<username>.github.io/<repo-name>/`

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Run full stack locally

```bash
cp .env.example .env
# Edit .env with MongoDB URI and secrets

cd backend
npm install
npm run dev
```

Open **http://localhost:5000** — backend serves the frontend from the project root.

---

## GitHub Pages + Backend (Full Features)

GitHub Pages hosts **static files only**. Deploy the API to [Render](https://render.com), [Railway](https://railway.app), or a VPS, then update `js/config.js`:

```javascript
const DEPLOYED_API_URL = 'https://your-api.onrender.com/api';
```

Also set `FRONTEND_URL` in backend `.env` to your GitHub Pages URL:

```env
FRONTEND_URL=https://your-username.github.io/your-repo-name
```

---

## Features

- **CGPA Predictor** – Required SGPA, semester plans, difficulty score
- **AI Study Planner** – OpenAI & Gemini powered schedules
- **Weakness Detector** – Marksheet analysis
- **Attendance Tracker** – 75% prediction
- **Backlog Recovery** – Priority roadmaps
- **Placement Readiness** – DSA, projects, aptitude tracking
- **AI Notes Generator** – PDF to flashcards & quizzes
- **Gamification** – XP, levels, leaderboard, challenges, badges
- **Productivity** – Pomodoro, focus mode, tasks, habits, goals
- **Admin Panel** – Users, reports, notifications, AI credits

---

## Default Admin

Set in `.env` (backend only):

```
ADMIN_EMAIL=admin@academicos.app
ADMIN_PASSWORD=Admin@123456
```

---

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) — VPS, Docker, Render, GitHub Pages + API

## License

MIT License
