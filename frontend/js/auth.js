const Auth = {
  getUser() {
    const data = localStorage.getItem('user') || sessionStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  },

  setSession(token, user, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  },

  async login(email, password, rememberMe = false) {
    const res = await api.post('/auth/login', { email, password, rememberMe });
    if (res.success) {
      this.setSession(res.token, res.user, rememberMe);
    }
    return res;
  },

  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.success) {
      this.setSession(res.token, res.user, false);
    }
    return res;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login.html';
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.requireAuth()) return false;
    if (!this.isAdmin()) {
      window.location.href = '/dashboard.html';
      return false;
    }
    return true;
  },

  async getProfile() {
    return api.get('/auth/me');
  }
};
