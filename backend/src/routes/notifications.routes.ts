import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext, organizationContextAllowExpired } from '../middleware/organizationContext';
import {
  getNotifications,
  markNotificationRead,
} from '../controllers/notificationController';

const router = Router();

// Get notifications — allow expired trial so dashboard doesn't 402
router.get('/', auth, organizationContextAllowExpired, getNotifications);

// Mark notification as read
router.put('/read', auth, organizationContext, markNotificationRead);

export default router;
