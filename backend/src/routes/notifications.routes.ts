import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  getNotifications,
  markNotificationRead,
} from '../controllers/notificationController';

const router = Router();

// Get notifications (requires auth + org context)
router.get('/', auth, organizationContext, getNotifications);

// Mark notification as read (requires auth + org context)
router.put('/read', auth, organizationContext, markNotificationRead);

export default router;
