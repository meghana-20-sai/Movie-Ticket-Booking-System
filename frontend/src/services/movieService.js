import api from './api';

export const movieService = {
  // ── Core Movie CRUD ──────────────────────────────────────
  getMovies: (params) => api.get('/movies', { params }),
  getMovieById: (id) => api.get(`/movies/${id}`),
  createMovie: (data) => api.post('/movies', data),
  updateMovie: (id, data) => api.put(`/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/movies/${id}`),

  // ── Dynamic Category Endpoints ───────────────────────────
  getNowShowing: (params) => api.get('/movies/now-showing', { params }),
  getNewReleases: (params) => api.get('/movies/new-releases', { params }),
  getRecentlyReleased: (params) => api.get('/movies/recent', { params }),
  getUpcoming: (params) => api.get('/movies/upcoming', { params }),
  getPopular: (params) => api.get('/movies/popular', { params }),
  getTrending: (params) => api.get('/movies/trending', { params }),
  getFeatured: (params) => api.get('/movies/featured', { params }),
  getTopIMDb: (params) => api.get('/movies/imdb/top-rated', { params }),
  getByLanguage: (lang, params) => api.get(`/movies/language/${lang}`, { params }),
  getByIndustry: (ind, params) => api.get(`/movies/industry/${ind}`, { params }),
  getByGenre: (genre, params) => api.get(`/movies/genre/${genre}`, { params }),

  // ── Sync (Admin) ─────────────────────────────────────────
  syncMovies: () => api.post('/movies/sync'),
  getSyncStatus: () => api.get('/movies/sync/status'),
  toggleFeatured: (id) => api.patch(`/movies/${id}/featured`),
  incrementView: (id) => api.patch(`/movies/${id}/view`),

  // ── Theatres & Shows ─────────────────────────────────────
  getTheatres: (params) => api.get('/theatres', { params }),
  getCities: () => api.get('/theatres/cities'),
  getTheatreById: (id) => api.get(`/theatres/${id}`),
  createTheatre: (data) => api.post('/theatres', data),
  updateTheatre: (id, data) => api.put(`/theatres/${id}`, data),
  deleteTheatre: (id) => api.delete(`/theatres/${id}`),

  // ── Screens ──────────────────────────────────────────────
  getScreens: (params) => api.get('/screens', { params }),
  getScreenById: (id) => api.get(`/screens/${id}`),
  createScreen: (data) => api.post('/screens', data),
  updateScreen: (id, data) => api.put(`/screens/${id}`, data),
  deleteScreen: (id) => api.delete(`/screens/${id}`),

  // ── Shows ────────────────────────────────────────────────
  getShows: (params) => api.get('/shows', { params }),
  getShowsForMovie: (movieId, params) => api.get(`/shows/movie/${movieId}`, { params }),
  getAvailableDates: (movieId, params) => api.get(`/shows/movie/${movieId}/dates`, { params }),
  getShowById: (id) => api.get(`/shows/${id}`),
  createShow: (data) => api.post('/shows', data),
  updateShow: (id, data) => api.put(`/shows/${id}`, data),
  deleteShow: (id) => api.delete(`/shows/${id}`),

  // ── Reviews ──────────────────────────────────────────────
  getMovieReviews: (movieId) => api.get(`/reviews/movie/${movieId}`),
  addReview: (movieId, data) => api.post(`/reviews/movie/${movieId}`, data),
};
