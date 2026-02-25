import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  sendMessage,
  getMessagesByCase,
  markMessagesRead,
  getUnreadCount,
} from '../controllers/messageController';

const router = Router();

// All message routes require authentication and organization context
router.use(auth);
router.use(organizationContext);

// Message routes
router.post('/', sendMessage); // POST /api/messages
router.get('/case/:caseId', getMessagesByCase); // GET /api/messages/case/:caseId
router.put('/read', markMessagesRead); // PUT /api/messages/read
router.get('/unread-count', getUnreadCount); // GET /api/messages/unread-count

export default router;
