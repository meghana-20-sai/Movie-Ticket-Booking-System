import api from './api';
import {
  DEFAULT_MOVIES,
  getFallbackByStatus,
  getFallbackByLanguage,
  getFallbackByIndustry,
  getFallbackTopIMDb,
} from '../data/defaultMovies';

/**
 * Resilient API wrapper: if the backend is waking up, sleeping, or unconfigured on Vercel,
 * it safely falls back to the curated authentic IMDb catalog so the user never sees an empty screen.
 */
const safeCall = async (apiCall, fallbackData) => {
  try {
    const res = await apiCall();
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res;
    }
    if (res && res.success && res.data) {
      return res;
    }
    return { success: true, data: fallbackData, fromFallback: true };
  } catch (err) {
    return { success: true, data: fallbackData, fromFallback: true };
  }
};

export const movieService = {
  // ── Core Movie CRUD ──────────────────────────────────────
  getMovies: (params) => safeCall(() => api.get('/movies', { params }), DEFAULT_MOVIES),
  getMovieById: async (id) => {
    try {
      const res = await api.get(`/movies/${id}`);
      if (res && res.success && res.data) return res;
    } catch (err) {
      // fallback
    }
    const found = DEFAULT_MOVIES.find((m) => m._id === id || m.id === id) || DEFAULT_MOVIES[0];
    return { success: true, data: found, fromFallback: true };
  },
  createMovie: (data) => api.post('/movies', data),
  updateMovie: (id, data) => api.put(`/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/movies/${id}`),

  // ── Dynamic Category Endpoints ───────────────────────────
  getNowShowing: (params) => safeCall(() => api.get('/movies/now-showing', { params }), getFallbackByStatus('now-showing')),
  getNewReleases: (params) => safeCall(() => api.get('/movies/new-releases', { params }), DEFAULT_MOVIES.slice(0, 8)),
  getRecentlyReleased: (params) => safeCall(() => api.get('/movies/recent', { params }), DEFAULT_MOVIES.slice(0, 8)),
  getUpcoming: (params) => safeCall(() => api.get('/movies/upcoming', { params }), getFallbackByStatus('upcoming')),
  getPopular: (params) => safeCall(() => api.get('/movies/popular', { params }), DEFAULT_MOVIES.slice(2, 10)),
  getTrending: (params) => safeCall(() => api.get('/movies/trending', { params }), DEFAULT_MOVIES.filter((m) => m.isTrending)),
  getFeatured: (params) => safeCall(() => api.get('/movies/featured', { params }), DEFAULT_MOVIES.filter((m) => m.isFeatured)),
  getTopIMDb: (params) => safeCall(() => api.get('/movies/imdb/top-rated', { params }), getFallbackTopIMDb()),
  getByLanguage: (lang, params) => safeCall(() => api.get(`/movies/language/${lang}`, { params }), getFallbackByLanguage(lang)),
  getByIndustry: (ind, params) => safeCall(() => api.get(`/movies/industry/${ind}`, { params }), getFallbackByIndustry(ind)),
  getByGenre: (genre, params) => safeCall(() => api.get(`/movies/genre/${genre}`, { params }), DEFAULT_MOVIES),

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

