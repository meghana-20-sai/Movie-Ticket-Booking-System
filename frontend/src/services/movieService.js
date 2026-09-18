import api from './api';

export const movieService = {
  getMovies: (params) => api.get('/movies', { params }),
  getMovieById: (id) => api.get(`/movies/${id}`),
  createMovie: (data) => api.post('/movies', data),
  updateMovie: (id, data) => api.put(`/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/movies/${id}`),

  // Theatres & Shows
  getTheatres: (params) => api.get('/theatres', { params }),
  getCities: () => api.get('/theatres/cities'),
  getTheatreById: (id) => api.get(`/theatres/${id}`),
  createTheatre: (data) => api.post('/theatres', data),
  updateTheatre: (id, data) => api.put(`/theatres/${id}`, data),
  deleteTheatre: (id) => api.delete(`/theatres/${id}`),

  // Screens
  getScreens: (params) => api.get('/screens', { params }),
  getScreenById: (id) => api.get(`/screens/${id}`),
  createScreen: (data) => api.post('/screens', data),
  updateScreen: (id, data) => api.put(`/screens/${id}`, data),
  deleteScreen: (id) => api.delete(`/screens/${id}`),

  // Shows
  getShows: (params) => api.get('/shows', { params }),
  getShowsForMovie: (movieId, params) => api.get(`/shows/movie/${movieId}`, { params }),
  getAvailableDates: (movieId, params) => api.get(`/shows/movie/${movieId}/dates`, { params }),
  getShowById: (id) => api.get(`/shows/${id}`),
  createShow: (data) => api.post('/shows', data),
  updateShow: (id, data) => api.put(`/shows/${id}`, data),
  deleteShow: (id) => api.delete(`/shows/${id}`),

  // Reviews
  getMovieReviews: (movieId) => api.get(`/reviews/movie/${movieId}`),
  addReview: (movieId, data) => api.post(`/reviews/movie/${movieId}`, data),
};
