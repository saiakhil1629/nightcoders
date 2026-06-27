import express from 'express';
import { getPendingRequests, resolveRequest, getStudentsList } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin', 'SuperAdmin'));

router.get('/pending-requests', getPendingRequests);
router.post('/resolve-request/:id', resolveRequest);
router.get('/students', getStudentsList);

export default router;
