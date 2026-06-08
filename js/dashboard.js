let charts = {};
let pomodoroInterval = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;

const SECTION_TITLES = {
  overview: 'Overview', cgpa: 'CGPA Predictor', 'study-plan': 'AI Study Planner',
  weakness: 'Weakness Detector', attendance: 'Attendance Tracker', backlog: 'Backlog Recovery',
  placement: 'Placement Readiness', analytics: 'Smart Analytics', 'exam-predict': 'Exam Predictor',
  notes: 'AI Notes Generator', topper: 'Topper Mode', productivity: 'Productivity',
  gamification: 'Gamification', tasks: 'Task Manager'
};

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;
  initDashboard();
});

function applyUserProfile(user) {
  if (!user) return;
  const firstName = Utils.getFirstName(user.name);
  const initial = Utils.getInitial(user.name);

  const nameEl = document.getElementById('userName');
  if (nameEl) nameEl.textContent = firstName;

  const welcomeName = document.getElementById('welcomeName');
  if (welcomeName) welcomeName.textContent = firstName;

  const avatar = document.getElementById('userAvatar');
  if (avatar) {
    avatar.textContent = initial;
    avatar.title = user.name || firstName;
  }

  const welcomeAvatar = document.getElementById('welcomeAvatar');
  if (welcomeAvatar) welcomeAvatar.textContent = initial;

  updateUserStats(user);
}

async function initDashboard() {
  const user = Auth.getUser();
  if (user) applyUserProfile(user);

  try {
    const res = await Auth.getProfile();
    if (res?.data) {
      const merged = { ...user, ...res.data, name: res.data.name || user?.name };
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(merged));
      applyUserProfile(merged);
    }
  } catch {}

  bindNavigation();
  bindForms();
  loadOverview();
  loadNotifications();

  const hash = window.location.hash.replace('#', '');
  if (hash && SECTION_TITLES[hash]) navigateTo(hash);
}

function updateUserStats(user) {
  document.getElementById('userLevel').textContent = user.level || 1;
  document.getElementById('userXP').textContent = user.xp || 0;
  document.getElementById('xpVal').textContent = user.xp || 0;
  document.getElementById('levelVal').textContent = user.level || 1;
  const streak = user.studyStreak || 0;
  document.getElementById('streakVal').textContent = streak + (streak === 1 ? ' day' : ' days');
  document.getElementById('creditsVal').textContent = user.aiCredits || 50;
  document.getElementById('aiCredits').textContent = (user.aiCredits || 50) + ' AI Credits';
  const xpProgress = ((user.xp || 0) % 100);
  document.getElementById('xpBar').style.width = xpProgress + '%';
}

function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function bindNavigation() {
  document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.section);
      closeSidebar();
    });
  });
}

function navigateTo(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`section-${section}`)?.classList.remove('hidden');
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
  document.getElementById('pageTitle').textContent = SECTION_TITLES[section] || section;
  window.location.hash = section;

  const loaders = {
    analytics: loadAnalytics,
    'study-plan': loadSavedPlans,
    notes: loadNotes,
    gamification: loadGamification,
    tasks: loadTasks,
    attendance: loadAttendance,
    placement: loadPlacement,
    productivity: () => { loadHabits(); loadGoals(); }
  };
  loaders[section]?.();
}

function bindForms() {
  document.getElementById('cgpaForm')?.addEventListener('submit', handleCGPA);
  document.getElementById('studyPlanForm')?.addEventListener('submit', handleStudyPlan);
  document.getElementById('weaknessForm')?.addEventListener('submit', handleWeakness);
  document.getElementById('attendanceForm')?.addEventListener('submit', handleAttendance);
  document.getElementById('backlogForm')?.addEventListener('submit', handleBacklog);
  document.getElementById('placementForm')?.addEventListener('submit', handlePlacement);
  document.getElementById('examPredictForm')?.addEventListener('submit', handleExamPredict);
  document.getElementById('notesGenerateForm')?.addEventListener('submit', handleNotesGenerate);
  document.getElementById('notesManualForm')?.addEventListener('submit', handleNotesManual);
  document.getElementById('topperForm')?.addEventListener('submit', handleTopper);
  document.getElementById('habitForm')?.addEventListener('submit', handleAddHabit);
  document.getElementById('goalForm')?.addEventListener('submit', handleAddGoal);
}

// Overview
async function loadOverview() {
  try {
    const [challenges, profile] = await Promise.all([
      api.get('/gamification/challenges'),
      api.get('/gamification/profile')
    ]);
    const el = document.getElementById('overviewChallenges');
    if (challenges.data?.length) {
      el.innerHTML = challenges.data.slice(0, 3).map(c => `
        <div class="flex justify-between items-center p-2 rounded-lg bg-[var(--bg-glass)]">
          <span>${c.title}</span>
          <span class="text-xs text-[var(--text-muted)]">${c.progress}/${c.target}</span>
        </div>`).join('');
    } else {
      el.innerHTML = '<p class="text-[var(--text-muted)]">No active challenges</p>';
    }
    if (profile.data) applyUserProfile({ ...Auth.getUser(), ...profile.data });
  } catch {}
}

// CGPA
async function handleCGPA(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = {
    currentCGPA: parseFloat(fd.get('currentCGPA')),
    targetCGPA: parseFloat(fd.get('targetCGPA')),
    remainingSemesters: parseInt(fd.get('remainingSemesters'))
  };
  try {
    const res = await api.post('/cgpa/predict', data);
    const d = res.data;
    document.getElementById('cgpaResults').innerHTML = `
      <div class="text-center mb-6">
        <div class="text-5xl font-bold gradient-text">${d.requiredSGPA}</div>
        <div class="text-[var(--text-secondary)]">Required SGPA per semester</div>
      </div>
      <div class="flex justify-center mb-6">
        <span class="badge ${d.difficultyScore <= 60 ? 'badge-success' : 'badge-warning'}">
          Difficulty: ${d.difficultyScore}/100
        </span>
      </div>
      <h4 class="font-semibold mb-3">Semester Plan</h4>
      <div class="space-y-2 max-h-64 overflow-y-auto">
        ${d.semesterPlan.map(s => `
          <div class="p-3 rounded-lg bg-[var(--bg-glass)]">
            <div class="flex justify-between"><span>Semester ${s.semester}</span><span class="font-semibold">SGPA: ${s.targetSGPA.toFixed(2)}</span></div>
          </div>`).join('')}
      </div>
      <p class="text-sm mt-4 text-center ${d.feasible ? 'text-green-400' : 'text-yellow-400'}">
        ${d.feasible ? 'Target is achievable with consistent effort.' : 'Consider adjusting your target CGPA.'}
      </p>`;
    Utils.toast('CGPA prediction complete!', 'success');
  } catch (err) { Utils.toast(err.message, 'error'); }
}

// Study Plan
async function handleStudyPlan(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const subjects = fd.get('subjects').split(',').map(s => s.trim());
  try {
    const res = await api.post('/study-plans', {
      title: fd.get('title'),
      subjects,
      examDate: fd.get('examDate'),
      availableHours: parseInt(fd.get('availableHours'))
    });
    renderStudyPlan(res.data);
    Utils.toast('Study plan generated!', 'success');
    refreshCredits();
    loadSavedPlans();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

function renderStudyPlan(plan) {
  const el = document.getElementById('studyPlanResults');
  let html = `<h4 class="font-semibold mb-2">${plan.title || 'Study Plan'}</h4>`;
  html += '<div class="mb-4"><strong>Daily Schedule:</strong>';
  (plan.dailySchedule || []).slice(0, 7).forEach(day => {
    html += `<div class="mt-2 p-2 rounded bg-[var(--bg-glass)]"><strong>Day ${day.day}:</strong> `;
    html += (day.tasks || []).map(t => `${t.subject} (${t.duration}min)`).join(', ');
    html += '</div>';
  });
  html += '</div>';
  if (plan.revisionPlan?.length) {
    html += '<div><strong>Revision Plan:</strong>';
    plan.revisionPlan.forEach(r => {
      html += `<div class="mt-1 text-[var(--text-secondary)]">${r.phase}: ${(r.subjects || []).join(', ')}</div>`;
    });
    html += '</div>';
  }
  el.innerHTML = html;
}

async function loadSavedPlans() {
  try {
    const res = await api.get('/study-plans');
    const el = document.getElementById('savedPlans');
    if (!res.data?.length) { el.innerHTML = '<p class="text-[var(--text-muted)]">No saved plans</p>'; return; }
    el.innerHTML = res.data.map(p => `
      <div class="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-glass)] mb-2 cursor-pointer hover:border-primary" onclick='renderStudyPlan(${JSON.stringify(p).replace(/'/g, "&#39;")})'>
        <div><div class="font-medium">${p.title}</div><div class="text-xs text-[var(--text-muted)]">Exam: ${Utils.formatDate(p.examDate)}</div></div>
        <span class="badge ${p.status === 'active' ? 'badge-primary' : 'badge-success'}">${p.status}</span>
      </div>`).join('');
  } catch {}
}

// Weakness
function addMarkRow() {
  const container = document.getElementById('marksContainer');
  const row = document.createElement('div');
  row.className = 'marks-row grid grid-cols-3 gap-2 mb-2';
  row.innerHTML = `
    <input type="text" placeholder="Subject" class="input-field mark-subject">
    <input type="number" placeholder="Marks" class="input-field mark-marks">
    <input type="number" placeholder="Max" class="input-field mark-max" value="100">`;
  container.appendChild(row);
}

async function handleWeakness(e) {
  e.preventDefault();
  const rows = document.querySelectorAll('.marks-row');
  const internalMarks = [];
  rows.forEach(row => {
    const subject = row.querySelector('.mark-subject').value;
    const marks = parseFloat(row.querySelector('.mark-marks').value);
    const maxMarks = parseFloat(row.querySelector('.mark-max').value) || 100;
    if (subject && !isNaN(marks)) internalMarks.push({ subject, marks, maxMarks });
  });

  const fileInput = e.target.querySelector('input[type="file"]');
  try {
    let res;
    if (fileInput.files[0]) {
      const fd = new FormData();
      fd.append('file', fileInput.files[0]);
      fd.append('internalMarks', JSON.stringify(internalMarks));
      res = await api.upload('/weakness/analyze', fd);
    } else {
      res = await api.post('/weakness/analyze', { internalMarks });
    }
    const d = res.data;
    document.getElementById('weaknessResults').innerHTML = `
      <h4 class="font-semibold text-red-400 mb-3">Weak Subjects</h4>
      ${(d.weakSubjects || []).map(s => `
        <div class="p-3 rounded-lg bg-red-500/10 mb-2">
          <div class="flex justify-between"><span>${s.name}</span><span>${s.score}%</span></div>
          <div class="text-xs text-[var(--text-muted)] mt-1">${s.recommendation || ''}</div>
        </div>`).join('')}
      <h4 class="font-semibold text-green-400 mb-3 mt-4">Strong Subjects</h4>
      ${(d.strongSubjects || []).map(s => `
        <div class="p-3 rounded-lg bg-green-500/10 mb-2 flex justify-between">
          <span>${s.name}</span><span>${s.score}%</span>
        </div>`).join('')}
      <h4 class="font-semibold mb-3 mt-4">Recommended Study Time</h4>
      ${(d.recommendedStudyTime || []).map(s => `
        <div class="flex justify-between text-sm py-1">
          <span>${s.subject}</span><span>${s.hours} hrs/week</span>
        </div>`).join('')}`;
    refreshCredits();
    Utils.toast('Analysis complete!', 'success');
  } catch (err) { Utils.toast(err.message, 'error'); }
}

// Attendance
async function handleAttendance(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await api.post('/attendance', {
      subject: fd.get('subject'),
      presentClasses: parseInt(fd.get('presentClasses')),
      totalClasses: parseInt(fd.get('totalClasses'))
    });
    Utils.toast('Attendance saved!', 'success');
    loadAttendance();
    e.target.reset();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function loadAttendance() {
  try {
    const res = await api.get('/attendance');
    const el = document.getElementById('attendanceResults');
    if (!res.data?.length) { el.innerHTML = '<p class="text-[var(--text-muted)] text-center py-8">No records yet</p>'; return; }
    el.innerHTML = `<h3 class="font-semibold mb-4">Your Attendance</h3>` + res.data.map(a => {
      const pct = a.percentage || 0;
      return `
        <div class="p-4 rounded-lg bg-[var(--bg-glass)] mb-3">
          <div class="flex justify-between mb-2"><span class="font-medium">${a.subject}</span>
            <span class="badge ${pct >= 75 ? 'badge-success' : 'badge-warning'}">${pct}%</span></div>
          <div class="progress-bar mb-2"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="text-xs text-[var(--text-muted)]">${a.presentClasses}/${a.totalClasses} classes
            ${a.classesNeeded > 0 ? ` • Need ${a.classesNeeded} more for 75%` : ' • Above 75%'}</div>
        </div>`;
    }).join('');
  } catch {}
}

// Backlog
function addBacklogRow() {
  const container = document.getElementById('backlogContainer');
  const row = document.createElement('div');
  row.className = 'backlog-row grid grid-cols-2 gap-2 mb-2';
  row.innerHTML = `
    <input type="text" placeholder="Subject" class="input-field backlog-subject">
    <input type="date" class="input-field backlog-date">`;
  container.appendChild(row);
}

async function handleBacklog(e) {
  e.preventDefault();
  const rows = document.querySelectorAll('.backlog-row');
  const subjects = [];
  rows.forEach(row => {
    const name = row.querySelector('.backlog-subject').value;
    const examDate = row.querySelector('.backlog-date').value;
    if (name && examDate) subjects.push({ name, examDate });
  });
  if (!subjects.length) return Utils.toast('Add at least one subject', 'error');
  try {
    const res = await api.post('/backlogs', { subjects });
    const d = res.data;
    document.getElementById('backlogResults').innerHTML = `
      <div class="card"><h3 class="font-semibold mb-4">Recovery Roadmap</h3>
        ${(d.recoveryRoadmap || []).map(r => `
          <div class="p-4 rounded-lg bg-[var(--bg-glass)] mb-3">
            <div class="font-medium mb-2">Week ${r.week}: ${r.subject}</div>
            <ul class="text-sm text-[var(--text-secondary)] list-disc ml-4">
              ${(r.tasks || []).map(t => `<li>${t}</li>`).join('')}
            </ul>
            <div class="text-xs text-[var(--text-muted)] mt-2">${r.hours} hours recommended</div>
          </div>`).join('')}
      </div>`;
    Utils.toast('Recovery plan generated!', 'success');
  } catch (err) { Utils.toast(err.message, 'error'); }
}

// Placement
async function loadPlacement() {
  try {
    const res = await api.get('/placement');
    if (res.data) {
      const f = document.getElementById('placementForm');
      if (f) {
        f.dsaProblemsSolved.value = res.data.dsaProblemsSolved || 0;
        f.projectsBuilt.value = res.data.projectsBuilt || 0;
        f.aptitudeScore.value = res.data.aptitudeScore || 0;
        f.communicationScore.value = res.data.communicationScore || 0;
      }
      renderPlacement(res.data);
    }
  } catch {}
}

async function handlePlacement(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await api.put('/placement', {
      dsaProblemsSolved: parseInt(fd.get('dsaProblemsSolved')),
      projectsBuilt: parseInt(fd.get('projectsBuilt')),
      aptitudeScore: parseInt(fd.get('aptitudeScore')),
      communicationScore: parseInt(fd.get('communicationScore'))
    });
    renderPlacement(res.data);
    Utils.toast('Placement score updated!', 'success');
  } catch (err) { Utils.toast(err.message, 'error'); }
}

function renderPlacement(d) {
  document.getElementById('placementResults').innerHTML = `
    <div class="text-center mb-6">
      <div class="text-5xl font-bold gradient-text">${d.readinessScore}%</div>
      <div class="text-[var(--text-secondary)]">Placement Readiness</div>
    </div>
    <div class="progress-bar mb-6"><div class="progress-fill" style="width:${d.readinessScore}%"></div></div>
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="p-3 rounded-lg bg-[var(--bg-glass)] text-center">
        <div class="text-2xl font-bold">${d.dsaProblemsSolved}</div><div class="text-xs text-[var(--text-muted)]">DSA Solved</div></div>
      <div class="p-3 rounded-lg bg-[var(--bg-glass)] text-center">
        <div class="text-2xl font-bold">${d.projectsBuilt}</div><div class="text-xs text-[var(--text-muted)]">Projects</div></div>
    </div>
    <h4 class="font-semibold mb-2">Suggestions</h4>
    <ul class="text-sm text-[var(--text-secondary)] space-y-1">
      ${(d.suggestions || []).map(s => `<li>• ${s}</li>`).join('')}
    </ul>`;
}

// Analytics
async function loadAnalytics() {
  try {
    const res = await api.get('/analytics/dashboard');
    const d = res.data;
    const chartDefaults = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }
    };

    destroyChart('studyHoursChart');
    charts.studyHours = new Chart(document.getElementById('studyHoursChart'), {
      type: 'line',
      data: {
        labels: d.studyHours.labels.length ? d.studyHours.labels : ['No data'],
        datasets: [{ data: d.studyHours.values.length ? d.studyHours.values : [0], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 }]
      },
      options: chartDefaults
    });

    destroyChart('cgpaChart');
    charts.cgpa = new Chart(document.getElementById('cgpaChart'), {
      type: 'line',
      data: {
        labels: d.cgpaProgress.labels.length ? d.cgpaProgress.labels : ['Start'],
        datasets: [{ data: d.cgpaProgress.values.length ? d.cgpaProgress.values : [0], borderColor: '#8b5cf6', tension: 0.4 }]
      },
      options: chartDefaults
    });

    destroyChart('attendanceChart');
    charts.attendance = new Chart(document.getElementById('attendanceChart'), {
      type: 'bar',
      data: {
        labels: d.attendance.labels.length ? d.attendance.labels : ['No data'],
        datasets: [{ data: d.attendance.values.length ? d.attendance.values : [0], backgroundColor: '#06b6d4' }]
      },
      options: chartDefaults
    });

    destroyChart('subjectChart');
    charts.subject = new Chart(document.getElementById('subjectChart'), {
      type: 'radar',
      data: {
        labels: d.subjectPerformance.labels.length ? d.subjectPerformance.labels : ['N/A'],
        datasets: [{ data: d.subjectPerformance.values.length ? d.subjectPerformance.values : [0], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.2)' }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { r: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
    });
  } catch (err) { Utils.toast('Failed to load analytics', 'error'); }
}

function destroyChart(id) {
  const key = id.replace('Chart', '').replace('studyHours', 'studyHours').replace('cgpa', 'cgpa').replace('attendance', 'attendance').replace('subject', 'subject');
  Object.keys(charts).forEach(k => {
    if (charts[k]) { charts[k].destroy(); delete charts[k]; }
  });
}

// Exam Predictor
async function handleExamPredict(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await api.post('/analytics/predict-exam', {
      internalMarks: parseFloat(fd.get('internalMarks')),
      attendance: parseFloat(fd.get('attendance')),
      assignments: parseFloat(fd.get('assignments'))
    });
    const d = res.data;
    document.getElementById('examPredictResults').innerHTML = `
      <div class="text-center">
        <div class="text-6xl font-bold gradient-text mb-2">${d.predicted}%</div>
        <div class="badge badge-primary text-lg mb-4">Grade: ${d.grade}</div>
        <p class="text-sm text-[var(--text-secondary)]">Based on internal marks (40%), attendance (10%), assignments (20%), and estimated external (30%)</p>
      </div>`;
  } catch (err) { Utils.toast(err.message, 'error'); }
}

// Notes
async function handleNotesGenerate(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await api.upload('/notes/generate', fd);
    Utils.toast('Notes generated!', 'success');
    refreshCredits();
    loadNotes();
    e.target.reset();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function handleNotesManual(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    await api.post('/notes', Object.fromEntries(fd));
    Utils.toast('Note saved!', 'success');
    loadNotes();
    e.target.reset();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function loadNotes() {
  try {
    const res = await api.get('/notes');
    const el = document.getElementById('notesList');
    if (!res.data?.length) { el.innerHTML = '<p class="text-[var(--text-muted)]">No notes yet</p>'; return; }
    el.innerHTML = res.data.map(n => `
      <div class="p-4 rounded-lg bg-[var(--bg-glass)] cursor-pointer" onclick="showNoteDetail('${n._id}')">
        <div class="flex justify-between"><span class="font-medium">${Utils.escapeHtml(n.title)}</span>
          <span class="badge ${n.type === 'ai-generated' ? 'badge-primary' : 'badge-success'} text-xs">${n.type === 'ai-generated' ? 'AI' : 'Manual'}</span></div>
        ${n.aiContent?.summary ? `<p class="text-xs text-[var(--text-muted)] mt-1 truncate">${Utils.escapeHtml(n.aiContent.summary.substring(0, 100))}...</p>` : ''}
      </div>`).join('');
    window._notes = res.data;
  } catch {}
}

function showNoteDetail(id) {
  const note = window._notes?.find(n => n._id === id);
  if (!note) return;
  let content = `<p class="mb-4">${Utils.escapeHtml(note.content || note.aiContent?.summary || '')}</p>`;
  if (note.aiContent?.flashcards?.length) {
    content += '<h4 class="font-semibold mb-2">Flashcards</h4>';
    note.aiContent.flashcards.forEach(f => {
      content += `<div class="p-2 rounded bg-[var(--bg-glass)] mb-2 text-sm"><strong>Q:</strong> ${Utils.escapeHtml(f.question)}<br><strong>A:</strong> ${Utils.escapeHtml(f.answer)}</div>`;
    });
  }
  Utils.createModal(note.title, content, [{ id: 'close', label: 'Close', class: 'btn-primary' }]);
}

// Topper Mode
async function handleTopper(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await api.post('/placement/topper-mode', {
      student: {
        cgpa: parseFloat(fd.get('cgpa')),
        studyHours: parseInt(fd.get('studyHours')),
        dsaSolved: parseInt(fd.get('dsaSolved')),
        mockTests: parseInt(fd.get('mockTests'))
      }
    });
    const { student, topper, analysis } = res.data;
    document.getElementById('topperResults').innerHTML = `
      <div class="grid md:grid-cols-2 gap-6">
        <div class="card"><h4 class="font-semibold mb-4">You</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>CGPA</span><span>${student.cgpa}</span></div>
            <div class="flex justify-between"><span>Study Hours/Week</span><span>${student.studyHours}</span></div>
            <div class="flex justify-between"><span>DSA Solved</span><span>${student.dsaSolved}</span></div>
            <div class="flex justify-between"><span>Mock Tests</span><span>${student.mockTests}</span></div>
          </div>
        </div>
        <div class="card border-primary/30"><h4 class="font-semibold mb-4">Topper Benchmark</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>CGPA</span><span class="text-green-400">${topper.cgpa}</span></div>
            <div class="flex justify-between"><span>Study Hours/Week</span><span class="text-green-400">${topper.studyHours}</span></div>
            <div class="flex justify-between"><span>DSA Solved</span><span class="text-green-400">${topper.dsaSolved}</span></div>
            <div class="flex justify-between"><span>Mock Tests</span><span class="text-green-400">${topper.mockTests}</span></div>
          </div>
        </div>
      </div>
      <div class="card mt-6"><h4 class="font-semibold mb-4">Gap Analysis & Recommendations</h4>
        <div class="grid md:grid-cols-3 gap-4 mb-4">
          <div class="stat-card text-center"><div class="stat-value text-yellow-400">+${analysis.additionalStudyHours}h</div><div class="stat-label">Study Hours Needed</div></div>
          <div class="stat-card text-center"><div class="stat-value text-blue-400">${analysis.dsaTargets}</div><div class="stat-label">More DSA Problems</div></div>
          <div class="stat-card text-center"><div class="stat-value text-purple-400">${analysis.mockTestTargets}</div><div class="stat-label">More Mock Tests</div></div>
        </div>
        <ul class="text-sm space-y-1">${analysis.recommendations.map(r => `<li>• ${r}</li>`).join('')}</ul>
      </div>`;
  } catch (err) { Utils.toast(err.message, 'error'); }
}

// Pomodoro
function setPomodoroMode(minutes) {
  pomodoroSeconds = minutes * 60;
  pomodoroRunning = false;
  clearInterval(pomodoroInterval);
  updatePomodoroDisplay();
  document.querySelectorAll('[data-pomo]').forEach(b => b.classList.toggle('active', b.dataset.pomo == minutes));
}

function updatePomodoroDisplay() {
  const m = Math.floor(pomodoroSeconds / 60);
  const s = pomodoroSeconds % 60;
  const display = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  document.getElementById('pomodoroDisplay').textContent = display;
  document.getElementById('focusTimer').textContent = display;
}

function startPomodoro() {
  if (pomodoroRunning) {
    pomodoroRunning = false;
    clearInterval(pomodoroInterval);
    document.getElementById('pomoStart').textContent = 'Start';
    document.getElementById('pomodoroDisplay').classList.remove('running');
    return;
  }
  pomodoroRunning = true;
  document.getElementById('pomoStart').textContent = 'Pause';
  document.getElementById('pomodoroDisplay').classList.add('running');
  pomodoroInterval = setInterval(() => {
    pomodoroSeconds--;
    updatePomodoroDisplay();
    if (pomodoroSeconds <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroRunning = false;
      document.getElementById('pomoStart').textContent = 'Start';
      document.getElementById('pomodoroDisplay').classList.remove('running');
      Utils.toast('Pomodoro complete! +XP earned', 'success');
      const duration = parseInt(document.querySelector('[data-pomo].active')?.dataset.pomo || 25);
      api.post('/productivity/sessions', { duration, type: 'pomodoro' }).catch(() => {});
    }
  }, 1000);
}

function resetPomodoro() {
  pomodoroRunning = false;
  clearInterval(pomodoroInterval);
  const active = document.querySelector('[data-pomo].active');
  pomodoroSeconds = parseInt(active?.dataset.pomo || 25) * 60;
  updatePomodoroDisplay();
  document.getElementById('pomoStart').textContent = 'Start';
  document.getElementById('pomodoroDisplay').classList.remove('running');
}

function enterFocusMode() {
  document.getElementById('focusMode').classList.add('active');
  if (!pomodoroRunning) startPomodoro();
}

function exitFocusMode() {
  document.getElementById('focusMode').classList.remove('active');
}

// Habits & Goals
async function handleAddHabit(e) {
  e.preventDefault();
  const name = new FormData(e.target).get('name');
  try {
    await api.post('/productivity/habits', { name });
    Utils.toast('Habit added!', 'success');
    loadHabits();
    e.target.reset();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function loadHabits() {
  try {
    const res = await api.get('/productivity/habits');
    document.getElementById('habitsList').innerHTML = (res.data || []).map(h => `
      <div class="flex justify-between items-center p-2 rounded-lg bg-[var(--bg-glass)]">
        <span>${h.name} <span class="text-xs text-[var(--text-muted)]">${h.streak} day streak</span></span>
        <button onclick="completeHabit('${h._id}')" class="btn btn-primary text-xs py-1 px-3">Done</button>
      </div>`).join('') || '<p class="text-[var(--text-muted)] text-sm">No habits yet</p>';
  } catch {}
}

async function completeHabit(id) {
  try {
    await api.post(`/productivity/habits/${id}/complete`);
    Utils.toast('Habit completed! +5 XP', 'success');
    loadHabits();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function handleAddGoal(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    await api.post('/productivity/goals', {
      title: fd.get('title'),
      targetValue: parseFloat(fd.get('targetValue')),
      unit: fd.get('unit')
    });
    Utils.toast('Goal added!', 'success');
    loadGoals();
    e.target.reset();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

async function loadGoals() {
  try {
    const res = await api.get('/productivity/goals');
    document.getElementById('goalsList').innerHTML = (res.data || []).map(g => {
      const pct = Math.min((g.currentValue / g.targetValue) * 100, 100);
      return `
        <div class="p-3 rounded-lg bg-[var(--bg-glass)]">
          <div class="flex justify-between mb-2"><span class="font-medium">${g.title}</span>
            <span class="text-sm">${g.currentValue}/${g.targetValue} ${g.unit}</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <button onclick="updateGoalProgress('${g._id}', ${g.currentValue + 1})" class="btn btn-secondary text-xs mt-2">+1 Progress</button>
        </div>`;
    }).join('') || '<p class="text-[var(--text-muted)] text-sm">No goals yet</p>';
  } catch {}
}

async function updateGoalProgress(id, value) {
  try {
    await api.put(`/productivity/goals/${id}`, { currentValue: value });
    loadGoals();
  } catch (err) { Utils.toast(err.message, 'error'); }
}

// Gamification
async function loadGamification() {
  try {
    const [lb, achievements, challenges] = await Promise.all([
      api.get('/gamification/leaderboard'),
      api.get('/gamification/achievements'),
      api.get('/gamification/challenges')
    ]);

    document.getElementById('leaderboard').innerHTML = `
      <table class="data-table">
        <thead><tr><th>#</th><th>Name</th><th>College</th><th>XP</th><th>Level</th></tr></thead>
        <tbody>${(lb.data || []).map((u, i) => `
          <tr><td>${i + 1}</td><td>${u.name}</td><td>${u.college || '-'}</td><td>${u.xp}</td><td>${u.level}</td></tr>
        `).join('')}</tbody>
      </table>`;

    document.getElementById('achievementsList').innerHTML = (achievements.data || []).map(a => `
      <div class="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-glass)]">
        <div class="avatar-initials" style="width:36px;height:36px;font-size:12px;margin:0">${(a.name || 'A').charAt(0)}</div>
        <div><div class="font-medium text-sm">${a.name}</div><div class="text-xs text-[var(--text-muted)]">+${a.xpReward} XP</div></div>
      </div>`).join('') || '<p class="text-[var(--text-muted)] text-sm">Complete challenges to earn badges!</p>';

    document.getElementById('challengesList').innerHTML = (challenges.data || []).map(c => {
      const pct = Math.min((c.progress / c.target) * 100, 100);
      return `
        <div class="p-4 rounded-lg bg-[var(--bg-glass)]">
          <div class="flex justify-between mb-2">
            <span class="font-medium text-sm">${c.title}</span>
            <span class="badge ${c.type === 'daily' ? 'badge-primary' : 'badge-warning'} text-xs">${c.type}</span>
          </div>
          <div class="progress-bar mb-2"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="flex justify-between text-xs text-[var(--text-muted)]">
            <span>${c.progress}/${c.target}</span><span>+${c.xpReward} XP</span>
          </div>
        </div>`;
    }).join('');
  } catch {}
}

// Tasks
async function loadTasks() {
  try {
    const res = await api.get('/productivity/tasks');
    document.getElementById('tasksList').innerHTML = (res.data || []).map(t => `
      <div class="flex items-center gap-4 p-4 rounded-lg bg-[var(--bg-glass)]">
        <input type="checkbox" ${t.status === 'done' ? 'checked' : ''} onchange="toggleTask('${t._id}', this.checked)" class="w-5 h-5">
        <div class="flex-1 ${t.status === 'done' ? 'line-through opacity-50' : ''}">
          <div class="font-medium">${Utils.escapeHtml(t.title)}</div>
          ${t.dueDate ? `<div class="text-xs text-[var(--text-muted)]">Due: ${Utils.formatDate(t.dueDate)}</div>` : ''}
        </div>
        <span class="badge ${t.priority === 'high' ? 'badge-warning' : 'badge-primary'} text-xs">${t.priority}</span>
        <button onclick="deleteTask('${t._id}')" class="text-red-400 text-xs font-medium">Delete</button>
      </div>`).join('') || '<p class="text-[var(--text-muted)]">No tasks yet. Add one to get started!</p>';
  } catch {}
}

function showAddTask() {
  Utils.createModal('Add Task', `
    <input id="taskTitle" class="input-field mb-3" placeholder="Task title">
    <select id="taskPriority" class="input-field mb-3">
      <option value="low">Low Priority</option>
      <option value="medium" selected>Medium Priority</option>
      <option value="high">High Priority</option>
    </select>
    <input id="taskDue" type="date" class="input-field">`,
    [
      { id: 'cancel', label: 'Cancel', class: 'btn-secondary' },
      { id: 'save', label: 'Add Task', class: 'btn-primary', handler: async () => {
        const title = document.getElementById('taskTitle').value;
        if (!title) return;
        try {
          await api.post('/productivity/tasks', {
            title,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDue').value || undefined
          });
          Utils.toast('Task added!', 'success');
          loadTasks();
        } catch (err) { Utils.toast(err.message, 'error'); }
      }}
    ]
  );
}

async function toggleTask(id, done) {
  try {
    await api.put(`/productivity/tasks/${id}`, { status: done ? 'done' : 'todo' });
    loadTasks();
  } catch {}
}

async function deleteTask(id) {
  try {
    await api.delete(`/productivity/tasks/${id}`);
    loadTasks();
  } catch {}
}

// Notifications
async function loadNotifications() {
  try {
    const res = await api.get('/notifications/unread');
    const count = res.data?.count || 0;
    const badge = document.getElementById('notifBadge');
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    }
  } catch {}
}

async function toggleNotifications() {
  const panel = document.getElementById('notifPanel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    try {
      const res = await api.get('/notifications');
      panel.innerHTML = (res.data || []).slice(0, 10).map(n => `
        <div class="p-3 rounded-lg mb-2 ${n.isRead ? 'opacity-60' : 'bg-[var(--bg-glass)]'}">
          <div class="font-medium text-sm">${n.title}</div>
          <div class="text-xs text-[var(--text-muted)]">${n.message}</div>
        </div>`).join('') || '<p class="text-sm text-[var(--text-muted)]">No notifications</p>';
      api.patch('/notifications/read-all').catch(() => {});
      document.getElementById('notifBadge').classList.add('hidden');
    } catch {}
  }
}

async function refreshCredits() {
  try {
    const res = await Auth.getProfile();
    if (res.data) {
      const user = Auth.getUser();
      user.aiCredits = res.data.aiCredits;
      user.xp = res.data.xp;
      user.level = res.data.level;
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      updateUserStats(user);
    }
  } catch {}
}
