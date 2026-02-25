import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  getOverviewAnalytics,
  getCaseTrends,
  getProfessionalPerformance,
} from '../controllers/immigrationAnalyticsController';

const router = Router();

// All analytics routes require authentication and organization context
router.use(auth);
router.use(organizationContext);

// Analytics routes (org_admin check is in controller)
router.get('/overview', getOverviewAnalytics); // GET /api/immigration-analytics/overview
router.get('/trends', getCaseTrends); // GET /api/immigration-analytics/trends
router.get('/professionals', getProfessionalPerformance); // GET /api/immigration-analytics/professionals

export default router;
