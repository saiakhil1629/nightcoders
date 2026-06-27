import express from 'express';
import { getTodayTask, getTaskByDay, completeTaskComponent, getRoadmap } from '../controllers/taskController.js';
import { runCode } from '../controllers/codeRunnerController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/today', getTodayTask);
router.get('/roadmap', getRoadmap);
router.get('/day/:dayNumber', getTaskByDay);
router.post('/complete', completeTaskComponent);
router.post('/run-code', runCode);

export default router;
