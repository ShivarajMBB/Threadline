import api from './config';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

export const authAPI = {
  async register(email, password, businessName) {
    const response = await api.post('/auth/register', {
      email,
      password,
      businessName
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  async connectInstagram(accessToken, pageId) {
    const response = await api.post('/auth/instagram/connect', {
      accessToken,
      pageId
    });
    return response.data;
  },

  getInstagramLoginUrl() {
    const token = localStorage.getItem('authToken');
    return `${API_BASE_URL}/auth/instagram/login?token=${encodeURIComponent(token || '')}`;
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
