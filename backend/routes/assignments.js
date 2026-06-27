import express from 'express';
import { getAssignments, submitAssignment } from '../controllers/assignmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAssignments);
router.post('/submit', upload.single('file'), submitAssignment);

export default router;
