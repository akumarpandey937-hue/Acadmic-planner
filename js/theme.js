const Theme = {
  init() {
    const saved = localStorage.getItem('theme') || 'dark';
    this.set(saved);
    this.bindToggle();
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      const lightIcon = btn.querySelector('.theme-icon-light');
      const darkIcon = btn.querySelector('.theme-icon-dark');
      if (lightIcon) lightIcon.style.display = isDark ? 'inline-flex' : 'none';
      if (darkIcon) darkIcon.style.display = isDark ? 'none' : 'inline-flex';
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
