const Utils = {
  getFirstName(name) {
    if (!name || !name.trim()) return 'Student';
    return name.trim().split(/\s+/)[0];
  },

  getInitial(name) {
    if (!name || !name.trim()) return 'S';
    return name.trim().charAt(0).toUpperCase();
  },

  toast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  },

  formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  },

  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  showLoader(element) {
    element.innerHTML = '<div class="flex justify-center py-8"><div class="loader"></div></div>';
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  animateCounter(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  },

  createModal(title, content, actions = []) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal">
        <h3 class="text-xl font-bold mb-4">${title}</h3>
        <div class="modal-body">${content}</div>
        <div class="flex gap-3 mt-6 justify-end">
          ${actions.map(a => `<button class="btn ${a.class || 'btn-secondary'}" data-action="${a.id}">${a.label}</button>`).join('')}
        </div>
      </div>`;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    actions.forEach(a => {
      overlay.querySelector(`[data-action="${a.id}"]`)?.addEventListener('click', () => {
        a.handler?.();
        overlay.remove();
      });
    });

    return overlay;
  }
};
