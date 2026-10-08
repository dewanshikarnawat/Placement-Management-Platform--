import { Router } from 'express';
import { getActivityLogs, createActivityLog } from '../controllers/activityController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, getActivityLogs);
router.post('/', authMiddleware, createActivityLog);

export default router;
