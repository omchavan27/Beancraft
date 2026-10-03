import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized / expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        // If token expired, clear and optionally redirect
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
