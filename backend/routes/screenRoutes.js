import express from 'express';
import {
  getScreens,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
} from '../controllers/screenController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').get(getScreens).post(protect, adminOnly, createScreen);
router
  .route('/:id')
  .get(getScreenById)
  .put(protect, adminOnly, updateScreen)
  .delete(protect, adminOnly, deleteScreen);

export default router;
