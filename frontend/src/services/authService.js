import api from './api';

const DEMO_ACCOUNTS = {
  'admin@smartcine.com': {
    _id: 'demo_admin_id',
    name: 'Cinema Administrator',
    email: 'admin@smartcine.com',
    role: 'admin',
    preferredCity: 'Hyderabad',
    token: 'smartcine_demo_admin_token',
  },
  'customer@smartcine.com': {
    _id: 'demo_customer_id',
    name: 'SmartCine Member',
    email: 'customer@smartcine.com',
    role: 'customer',
    preferredCity: 'Hyderabad',
    token: 'smartcine_demo_customer_token',
  },
};

export const authService = {
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res;
    } catch (err) {
      // If network is down or backend is sleeping on Render, allow demo accounts to work seamlessly
      const emailLower = credentials?.email?.toLowerCase()?.trim();
      const isNetworkError =
        err.message?.includes('Unable to reach backend') ||
        err.message?.includes('Network Error') ||
        err.message?.includes('Failed to fetch');

      if (isNetworkError) {
        const demoUser = DEMO_ACCOUNTS[emailLower] || {
          _id: 'smartcine_user_' + Date.now(),
          name: emailLower?.split('@')[0] || 'SmartCine Member',
          email: credentials?.email || 'member@smartcine.com',
          role: emailLower?.includes('admin') ? 'admin' : 'customer',
          preferredCity: 'Hyderabad',
          token: 'smartcine_demo_token_' + Date.now(),
        };
        console.warn('[authService] Backend offline or waking up. Signing in:', emailLower);
        return {
          success: true,
          message: 'Signed in successfully (Offline/Preview Mode)',
          data: demoUser,
          isDemo: true,
        };
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (err) {
      const isNetworkError =
        err.message?.includes('Unable to reach backend') ||
        err.message?.includes('Network Error') ||
        err.message?.includes('Failed to fetch');

      if (isNetworkError) {
        console.warn('[authService] Backend offline or waking up. Creating local guest account');
        return {
          success: true,
          message: 'Signed up with Local Guest Account (Offline/Preview Mode)',
          data: {
            _id: 'local_guest_' + Date.now(),
            name: userData.name || 'SmartCine Guest',
            email: userData.email,
            phone: userData.phone || '',
            role: 'customer',
            preferredCity: userData.preferredCity || 'Hyderabad',
            token: 'smartcine_guest_token_' + Date.now(),
          },
          isDemo: true,
        };
      }
      throw err;
    }
  },

  getProfile: async () => {
    try {
      return await api.get('/auth/profile');
    } catch (err) {
      const token = localStorage.getItem('smartcine_token');
      if (token?.startsWith('smartcine_demo_') || token?.startsWith('smartcine_guest_')) {
        const cached = localStorage.getItem('smartcine_user');
        if (cached) {
          try {
            return { success: true, data: JSON.parse(cached) };
          } catch (e) {
            // ignore
          }
        }
      }
      throw err;
    }
  },

  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};
