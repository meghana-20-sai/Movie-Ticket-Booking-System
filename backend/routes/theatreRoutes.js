import express from 'express';
import {
  getTheatres,
  getCities,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} from '../controllers/theatreController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/cities', getCities);
router.route('/').get(getTheatres).post(protect, adminOnly, createTheatre);
router
  .route('/:id')
  .get(getTheatreById)
  .put(protect, adminOnly, updateTheatre)
  .delete(protect, adminOnly, deleteTheatre);

export default router;
