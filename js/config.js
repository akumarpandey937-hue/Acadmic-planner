// Set your deployed backend URL when hosting frontend on GitHub Pages
// Example: 'https://academicos-api.onrender.com/api'
const DEPLOYED_API_URL = 'https://acadmic-planner-ashu.onrender.com';

const API_BASE = (() => {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  if (host.includes('github.io') && DEPLOYED_API_URL) {
    return DEPLOYED_API_URL;
  }
  if (host.includes('github.io')) {
    return 'http://localhost:5000/api';
  }
  return '/api';
})();

const APP_NAME = 'AcademicOS';

const GRADE_MAP = {
  90: 'A+', 80: 'A', 70: 'B+', 60: 'B', 50: 'C', 40: 'D', 0: 'F'
};

function getGrade(score) {
  for (const [min, grade] of Object.entries(GRADE_MAP).sort((a, b) => b[0] - a[0])) {
    if (score >= parseInt(min)) return grade;
  }
  return 'F';
}

function appPath(page) {
  const base = document.querySelector('base')?.getAttribute('href') || '';
  return base ? `${base}${page}` : page;
}
