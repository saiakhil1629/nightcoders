import express from 'express';
import { auditResume, auditPortfolio, chatInterview } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/resume-review', auditResume);
router.post('/portfolio-review', auditPortfolio);
router.post('/chat-interview', chatInterview);

export default router;
