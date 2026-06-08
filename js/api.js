class API {
  constructor() {
    this.base = API_BASE;
  }

  getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { ...options, headers, credentials: 'include' };

    try {
      const res = await fetch(`${this.base}${endpoint}`, config);
      const data = await res.json();

      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        Auth.logout();
        return data;
      }

      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  }

  get(endpoint) { return this.request(endpoint); }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async upload(endpoint, formData) {
    const token = this.getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.base}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  }
}

const api = new API();
