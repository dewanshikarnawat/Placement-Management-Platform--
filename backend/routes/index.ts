import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import internshipRoutes from './internshipRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import messageRoutes from './messageRoutes.js';
import activityRoutes from './activityRoutes.js';
import { upload } from '../config/multer.js';
import { uploadResumePdf } from '../controllers/applicationController.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/internships', internshipRoutes);
router.use('/applications', applicationRoutes);
router.use('/messages', messageRoutes);
router.use('/activity-logs', activityRoutes);

// Direct upload fallback for profile document synchronizer compatibility
router.post('/upload', upload.single('resume'), uploadResumePdf);

export default router;
