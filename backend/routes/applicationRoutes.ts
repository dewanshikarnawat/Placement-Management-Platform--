import { Router } from 'express';
import { 
  getApplications, 
  createApplication, 
  updateApplication, 
  uploadResumePdf,
  verifyApplication
} from '../controllers/applicationController.js';
import { upload } from '../config/multer.js';
import { authMiddleware, studentMiddleware, facultyMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, getApplications);
router.post('/', authMiddleware, studentMiddleware, createApplication);
router.put('/:id', authMiddleware, updateApplication);
router.put('/:id/verify', authMiddleware, facultyMiddleware, verifyApplication);
router.post('/upload', authMiddleware, studentMiddleware, upload.single('resume'), uploadResumePdf);

export default router;
