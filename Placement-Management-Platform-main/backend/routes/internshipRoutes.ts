import { Router } from 'express';
import { getInternships, createInternship, updateInternship, deleteInternship } from '../controllers/internshipController.js';
import { authMiddleware, companyMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', getInternships);
router.post('/', authMiddleware, companyMiddleware, createInternship);
router.put('/:id', authMiddleware, updateInternship);
router.delete('/:id', authMiddleware, companyMiddleware, deleteInternship);

export default router;

