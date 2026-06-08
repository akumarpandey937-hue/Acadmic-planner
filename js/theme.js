const Theme = {
  init() {
    const saved = localStorage.getItem('theme') || 'dark';
    this.set(saved);
    this.bindToggle();
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.querySelectorAll('.theme-icon-dark, .theme-icon-light').forEach(el => {
      el.style.display = 'none';
    });
    document.querySelectorAll(`.theme-icon-${theme === 'dark' ? 'light' : 'dark'}`).forEach(el => {
      el.style.display = 'inline';
    });
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    this.set(current === 'dark' ? 'light' : 'dark');
  },

  bindToggle() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Theme.init());
