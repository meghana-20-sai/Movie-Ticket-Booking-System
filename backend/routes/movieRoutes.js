import express from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getNowShowing,
  getNewReleases,
  getRecentlyReleased,
  getUpcoming,
  getPopular,
  getTrending,
  getFeatured,
  incrementView,
  syncMoviesNow,
  getSyncStatus,
  toggleFeatured,
  getTopIMDbMoviesHandler,
} from '../controllers/movieController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// ── Category endpoints (must come BEFORE /:id) ───────────────
router.get('/imdb/top-rated', getTopIMDbMoviesHandler);
router.get('/language/:language', getMovies); // Handled by extending buildBaseFilter in controller
router.get('/industry/:industry', getMovies);
router.get('/genre/:genre', getMovies);
router.get('/search', getMovies); // Handled by search query param
router.get('/filter', getMovies);
router.get('/now-showing', getNowShowing);
router.get('/new-releases', getNewReleases);
router.get('/recent', getRecentlyReleased);
router.get('/upcoming', getUpcoming);
router.get('/popular', getPopular);
router.get('/trending', getTrending);
router.get('/featured', getFeatured);

// ── Sync endpoints (admin only) ──────────────────────────────
router.get('/sync/status', protect, adminOnly, getSyncStatus);
router.post('/sync', protect, adminOnly, syncMoviesNow);

// ── CRUD ─────────────────────────────────────────────────────
router.route('/').get(getMovies).post(protect, adminOnly, createMovie);
router
  .route('/:id')
  .get(getMovieById)
  .put(protect, adminOnly, updateMovie)
  .delete(protect, adminOnly, deleteMovie);

// ── Misc ─────────────────────────────────────────────────────
router.patch('/:id/view', incrementView);
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);

export default router;
