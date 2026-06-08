const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

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
