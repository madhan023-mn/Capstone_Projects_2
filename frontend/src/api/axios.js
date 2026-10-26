import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: inject Bearer JWT from localStorage into outgoing requests
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

// Interceptor: handle 401 Unauthorized globally without interfering with login attempts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthAction = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
      const isCurrentPageAuth = typeof window !== 'undefined' && (
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register')
      );

      // Only redirect if an established session expired on an authenticated/protected route
      if (!isAuthAction && !isCurrentPageAuth) {
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
