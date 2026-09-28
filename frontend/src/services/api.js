import axios from 'axios';

// Compute base API URL
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  let formatted = envUrl.trim();
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `https://${formatted}`;
  }
  if (!formatted.endsWith('/api')) {
    formatted = formatted.endsWith('/') ? `${formatted}api` : `${formatted}/api`;
  }
  return formatted;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartcine_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error unwrapping
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.response?.data?.message;
    if (!message) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message = 'Unable to reach backend server. If your server is on Render free tier, it may be waking up (please wait 30-45 seconds), or check that VITE_API_URL is correctly set.';
      } else {
        message = error.message || 'An unexpected error occurred. Please try again.';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
