import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
  getUsers: () => api.get('/auth/users'),
  toggleUser: (id) => api.put(`/auth/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  requestAccess: (data) => api.post('/auth/request-access', data),
  getAccessRequests: () => api.get('/auth/access-requests'),
  handleAccessRequest: (id, status) => api.put(`/auth/access-requests/${id}`, { status }),
};

// ─── Buses ────────────────────────────────────────────
export const busAPI = {
  getAll: (params) => api.get('/buses', { params }),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  delete: (id) => api.delete(`/buses/${id}`),
};

// ─── Maintenance ──────────────────────────────────────
export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  getOne: (id) => api.get(`/maintenance/${id}`),
  create: (formData) => api.post('/maintenance', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/maintenance/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

// ─── Reports ──────────────────────────────────────────
export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getMonthly: (year) => api.get('/reports/monthly', { params: { year } }),
  getBusWise: () => api.get('/reports/bus-wise'),
  getWorkType: () => api.get('/reports/work-type'),
};

export default api;
