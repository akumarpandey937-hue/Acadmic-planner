const FEATURES = [
  { icon: '📊', title: 'CGPA Predictor', desc: 'Calculate required SGPA and get semester-wise plans to reach your target CGPA.' },
  { icon: '🤖', title: 'AI Study Planner', desc: 'Generate daily, weekly, and revision schedules powered by OpenAI & Gemini.' },
  { icon: '🔍', title: 'Weakness Detector', desc: 'Upload marksheets to identify weak subjects and get study recommendations.' },
  { icon: '📅', title: 'Attendance Tracker', desc: 'Track attendance per subject and predict if you can reach 75%.' },
  { icon: '📚', title: 'Backlog Recovery', desc: 'Priority-based recovery roadmap for backlog subjects with exam dates.' },
  { icon: '🎯', title: 'Placement Readiness', desc: 'Track DSA, projects, aptitude, and communication scores.' },
  { icon: '📈', title: 'Smart Analytics', desc: 'Visualize study hours, CGPA progress, and subject performance.' },
  { icon: '📝', title: 'AI Notes Generator', desc: 'Upload PDFs/PPTs to generate summaries, flashcards, and quizzes.' },
  { icon: '🏆', title: 'Topper Mode', desc: 'Compare yourself with topper profiles and get gap analysis.' },
  { icon: '⏱️', title: 'Pomodoro & Focus', desc: 'Built-in productivity tools with XP rewards for study sessions.' }
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', college: 'IIT Delhi', text: 'AcademicOS helped me improve my CGPA from 7.2 to 8.6 in just 2 semesters. The AI study planner is a game changer!', avatar: '👩‍🎓' },
  { name: 'Rahul Verma', college: 'NIT Trichy', text: 'The placement readiness tracker kept me motivated. I landed my dream job at a top tech company!', avatar: '👨‍💻' },
  { name: 'Ananya Patel', college: 'BITS Pilani', text: 'The weakness detector identified my problem areas instantly. The gamification makes studying actually fun.', avatar: '👩‍🔬' }
];

const FAQS = [
  { q: 'Is AcademicOS free to use?', a: 'Yes! AcademicOS offers a free tier with 50 AI credits. Premium plans with unlimited AI features are coming soon.' },
  { q: 'How accurate is the CGPA predictor?', a: 'Our CGPA predictor uses proven mathematical models and provides semester-wise plans with difficulty scores. Accuracy depends on consistent performance.' },
  { q: 'Which AI models power the platform?', a: 'We integrate both OpenAI GPT-4 and Google Gemini for study planning, note generation, and weakness analysis with intelligent fallback.' },
  { q: 'Can I use AcademicOS on mobile?', a: 'Absolutely! AcademicOS is fully responsive and works seamlessly on phones, tablets, and desktops.' },
  { q: 'How does the gamification system work?', a: 'Earn XP for studying, completing tasks, and maintaining streaks. Level up, unlock badges, and compete on the leaderboard!' }
];

document.addEventListener('DOMContentLoaded', () => {
  AOS.init({ duration: 800, once: true, offset: 50 });

  // Features grid
  const grid = document.getElementById('featuresGrid');
  if (grid) {
    grid.innerHTML = FEATURES.map((f, i) => `
      <div class="card group cursor-pointer" data-aos="fade-up" data-aos-delay="${i * 50}">
        <div class="text-3xl mb-4 group-hover:scale-110 transition-transform">${f.icon}</div>
        <h3 class="text-lg font-semibold mb-2">${f.title}</h3>
        <p class="text-sm text-[var(--text-secondary)]">${f.desc}</p>
      </div>`).join('');
  }

  // Testimonials
  const tGrid = document.getElementById('testimonialsGrid');
  if (tGrid) {
    tGrid.innerHTML = TESTIMONIALS.map((t, i) => `
      <div class="card" data-aos="fade-up" data-aos-delay="${i * 100}">
        <div class="text-4xl mb-4">${t.avatar}</div>
        <p class="text-[var(--text-secondary)] mb-4 italic">"${t.text}"</p>
        <div class="font-semibold">${t.name}</div>
        <div class="text-sm text-[var(--text-muted)]">${t.college}</div>
      </div>`).join('');
  }

  // FAQ
  const faqList = document.getElementById('faqList');
  if (faqList) {
    faqList.innerHTML = FAQS.map((f, i) => `
      <div class="card cursor-pointer faq-item" data-aos="fade-up" data-aos-delay="${i * 50}" onclick="toggleFAQ(this)">
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">${f.q}</h3>
          <span class="faq-icon text-xl transition-transform">+</span>
        </div>
        <p class="faq-answer text-sm text-[var(--text-secondary)] mt-3 hidden">${f.a}</p>
      </div>`).join('');
  }

  // GSAP animations
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-content > *', { y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out' });
    gsap.from('.hero-visual', { x: 60, opacity: 0, duration: 1.2, delay: 0.3, ease: 'power3.out' });

    gsap.utils.toArray('.card').forEach(card => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%' },
        y: 40, opacity: 0, duration: 0.6, ease: 'power2.out'
      });
    });
  }

  // Counter animations
  setTimeout(() => {
    Utils.animateCounter(document.getElementById('statStudents'), 12500);
    const cgpaEl = document.getElementById('statCGPA');
    if (cgpaEl) { let v = 0; const iv = setInterval(() => { v += 0.1; cgpaEl.textContent = '+' + v.toFixed(1); if (v >= 1.2) clearInterval(iv); }, 50); }
    Utils.animateCounter(document.getElementById('statPlacement'), 87);
  }, 500);

  // Navbar scroll
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Contact form
  document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post('/contact', Object.fromEntries(fd));
      Utils.toast('Message sent successfully!', 'success');
      e.target.reset();
    } catch (err) {
      Utils.toast(err.message, 'error');
    }
  });

  // Hide loader
  setTimeout(() => document.getElementById('pageLoader')?.classList.add('hidden'), 800);
});

function toggleFAQ(el) {
  const answer = el.querySelector('.faq-answer');
  const icon = el.querySelector('.faq-icon');
  answer.classList.toggle('hidden');
  icon.textContent = answer.classList.contains('hidden') ? '+' : '−';
  icon.style.transform = answer.classList.contains('hidden') ? '' : 'rotate(45deg)';
}

function runCGPADemo() {
  const current = parseFloat(document.getElementById('demoCGPA').value);
  const target = parseFloat(document.getElementById('demoTarget').value);
  const remaining = parseInt(document.getElementById('demoSemesters').value);
  const completed = 4;
  const total = completed + remaining;
  const required = ((target * total) - (current * completed)) / remaining;
  const difficulty = required <= 7 ? 'Easy' : required <= 8.5 ? 'Moderate' : required <= 9.5 ? 'Hard' : 'Very Hard';

  const el = document.getElementById('cgpaDemoResult');
  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="text-center mb-2"><span class="text-3xl font-bold gradient-text">${required.toFixed(2)}</span></div>
    <div class="text-sm text-center text-[var(--text-secondary)]">Required SGPA per semester</div>
    <div class="mt-3 flex justify-center"><span class="badge ${required <= 8.5 ? 'badge-success' : 'badge-warning'}">${difficulty}</span></div>
    <div class="text-xs text-center mt-2 text-[var(--text-muted)]">${required <= 10 ? '✅ Achievable with consistent effort' : '⚠️ Target may need adjustment'}</div>`;
}

function runStudyDemo() {
  const subjects = document.getElementById('demoSubjects').value.split(',').map(s => s.trim());
  const hours = parseInt(document.getElementById('demoHours').value);
  const days = parseInt(document.getElementById('demoDays').value);
  const el = document.getElementById('studyDemoResult');
  el.classList.remove('hidden');

  let html = '<div class="font-semibold mb-2">📅 Sample Daily Plan</div>';
  for (let d = 1; d <= Math.min(days, 5); d++) {
    html += `<div class="mb-2"><strong>Day ${d}:</strong> `;
    html += subjects.map(s => `${s} (${Math.floor(hours / subjects.length)}h)`).join(', ');
    html += '</div>';
  }
  if (days > 5) html += `<div class="text-[var(--text-muted)]">... and ${days - 5} more days</div>`;
  el.innerHTML = html;
}

function runPlacementDemo() {
  const dsa = parseInt(document.getElementById('demoDSA').value);
  const projects = parseInt(document.getElementById('demoProjects').value);
  const aptitude = parseInt(document.getElementById('demoAptitude').value);
  const comm = 60;
  const score = Math.round(
    Math.min(dsa / 300, 1) * 35 + Math.min(projects / 5, 1) * 25 + aptitude * 0.2 + comm * 0.2
  );

  document.getElementById('placementDemoResult').classList.remove('hidden');
  document.getElementById('placementScore').textContent = score + '%';
  document.getElementById('placementBar').style.width = score + '%';
}
