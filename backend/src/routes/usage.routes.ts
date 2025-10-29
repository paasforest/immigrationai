import { Router } from 'express';
import { usageController } from '../controllers/usageController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get current month usage
router.get('/current', usageController.getCurrentUsage);

// Get usage history with pagination
router.get('/history', usageController.getUsageHistory);

// Get usage statistics and trends
router.get('/stats', usageController.getUsageStats);

export default router;

