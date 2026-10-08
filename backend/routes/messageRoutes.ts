import { Router } from 'express';
import { getMessages, createMessage, markMessageRead } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, getMessages);
router.post('/', authMiddleware, createMessage);
router.put('/:id/read', authMiddleware, markMessageRead);

export default router;
