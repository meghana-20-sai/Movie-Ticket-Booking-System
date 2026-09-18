import express from 'express';
import {
  getShows,
  getShowsForMovie,
  getAvailableDates,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} from '../controllers/showController.js';
import { getSeatsForShow, lockSeats, releaseSeats } from '../controllers/seatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').get(getShows).post(protect, adminOnly, createShow);
router.get('/movie/:movieId', getShowsForMovie);
router.get('/movie/:movieId/dates', getAvailableDates);
router
  .route('/:id')
  .get(getShowById)
  .put(protect, adminOnly, updateShow)
  .delete(protect, adminOnly, deleteShow);

// Seat management subroutes under shows
router.get('/:showId/seats', getSeatsForShow);
router.post('/:showId/lock-seats', protect, lockSeats);
router.post('/:showId/release-seats', protect, releaseSeats);

export default router;
