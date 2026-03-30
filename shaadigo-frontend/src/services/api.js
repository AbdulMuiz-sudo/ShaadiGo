import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Venue APIs
export const venueService = {
  getAll: (params = {}) => api.get('/venues', { params }),
  getById: (id) => api.get(`/venues/${id}`),
  getFeatured: () => api.get('/venues/featured'),
  search: (filters) => api.get('/venues/search', { params: filters }),
};

// Booking APIs
export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/user/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

// Auth APIs (existing)
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
};

// Vendor APIs
export const vendorService = {
  getStats: () => api.get('/vendor/stats'),
  getBookings: () => api.get('/vendor/bookings'),
  getAnalytics: () => api.get('/vendor/analytics'),
};

export default api;
