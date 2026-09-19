import express from 'express';
import { parseCommand, getSuggestions } from '../controllers/commandController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/parse', optionalProtect, parseCommand);
router.get('/suggestions', getSuggestions);

export default router;
