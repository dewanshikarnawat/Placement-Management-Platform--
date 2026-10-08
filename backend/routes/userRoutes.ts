import { Router } from 'express';
import { 
  getUsers, 
  updateUser, 
  updateUserRole, 
  createUser, 
  deleteUser,
  uploadAvatarImage,
  enhanceBio,
  auditMatch,
  chatAdvisor
} from '../controllers/userController.js';
import { uploadAvatar } from '../config/multer.js';
import { authMiddleware, adminMiddleware, studentMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, getUsers);
router.post('/', authMiddleware, adminMiddleware, createUser);
router.put('/:id', authMiddleware, updateUser);
router.put('/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);
router.post('/upload-avatar', authMiddleware, uploadAvatar.single('avatar'), uploadAvatarImage);
router.post('/enhance-bio', authMiddleware, enhanceBio);
router.post('/audit-match', authMiddleware, studentMiddleware, auditMatch);
router.post('/chat', authMiddleware, studentMiddleware, chatAdvisor);

export default router;
