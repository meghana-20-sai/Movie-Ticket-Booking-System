import api from './api';

export const bookingService = {
  // Seats
  getSeatsForShow: (showId, userId) => api.get(`/shows/${showId}/seats`, { params: { userId } }),
  lockSeats: (showId, seatIds, socketId) => api.post(`/shows/${showId}/lock-seats`, { seatIds, socketId }),
  releaseSeats: (showId, seatIds) => api.post(`/shows/${showId}/release-seats`, { seatIds }),

  // Bookings
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel`),
  getAllBookings: (params) => api.get('/bookings', { params }),

  // Coupons
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  getCoupons: (params) => api.get('/coupons', { params }),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),

  // Admin Reviews Moderation
  getAllReviews: (params) => api.get('/reviews', { params }),
  moderateReview: (id, status) => api.put(`/reviews/${id}/status`, { status }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),

  // Admin Dashboard & Analytics
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/status`),
};
