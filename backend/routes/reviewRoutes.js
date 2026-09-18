import express from 'express';
import {
  getMovieReviews,
  addReview,
  getAllReviews,
  moderateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/movie/:movieId', getMovieReviews);
router.post('/movie/:movieId', protect, addReview);

// Admin review moderation routes
router.get('/', protect, adminOnly, getAllReviews);
router.put('/:id/status', protect, adminOnly, moderateReview);
router.delete('/:id', protect, adminOnly, deleteReview);

export default router;
