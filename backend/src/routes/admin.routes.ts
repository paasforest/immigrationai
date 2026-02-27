import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { eligibilityController } from '../controllers/eligibilityController';
import {
  listVisaRequirementsAdmin,
  getVisaRequirementAdmin,
  updateVisaRequirementAdmin,
  createVisaRequirementAdmin,
  listUpdateAlertsAdmin,
  resolveAlertAdmin,
} from '../controllers/aiController';
import { runVisaRulesMonitor } from '../services/visaRulesMonitor';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { sendSuccess, sendError } from '../utils/helpers';
import { logger } from '../utils/logger';

const router = Router();

// All admin routes require authentication AND admin role
router.use(requireAuth);
router.use(requireAdmin);

// Payment management
router.get('/payments/pending', adminController.getPendingPayments);
router.get('/payments/stats', adminController.getPaymentStats);
router.get('/payments/search/:accountNumber', adminController.searchPaymentsByAccount);
router.post('/payments/manual-verify', adminController.manualVerifyPayment);
router.post('/payments/:paymentId/verify', adminController.verifyPayment);
router.post('/payments/:paymentId/reject', adminController.rejectPayment);

// UTM Analytics
router.get('/analytics/utm', adminController.getUTMAnalytics);
router.get('/analytics/utm/sources', adminController.getUTMSources);
router.get('/analytics/utm/campaigns', adminController.getUTMCampaigns);
router.get('/analytics/utm/conversions', adminController.getUTMConversions);
router.get('/analytics/utm/sessions', adminController.getRecentSessions);
router.get('/analytics/utm/session-stats', adminController.getSessionStats);
router.get('/analytics/eligibility', eligibilityController.getAnalytics);

// Document Analytics
router.get('/analytics/documents', adminController.getDocumentAnalytics);

// Revenue Analytics
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

// System Health
router.get('/system/health', adminController.getSystemHealth);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);

// ──────────────────────────────────────────────────────────────────────────────
// VISA INTELLIGENCE — Verified Rules Database
// Admin-only CRUD for the VisaRequirements table (the RAG ground truth layer).
// ──────────────────────────────────────────────────────────────────────────────
router.get('/visa-rules', listVisaRequirementsAdmin);
router.post('/visa-rules', createVisaRequirementAdmin);
router.get('/visa-rules/:id', getVisaRequirementAdmin);
router.put('/visa-rules/:id', updateVisaRequirementAdmin);

// Update Alerts (from monitoring cron)
router.get('/visa-rules/alerts', listUpdateAlertsAdmin);
router.post('/visa-rules/alerts/:id/resolve', resolveAlertAdmin);

// Manual trigger for the monitoring cron (admin only — for testing or immediate checks)
router.post('/visa-rules/run-monitor', async (req, res) => {
  try {
    logger.info('Manual visa rules monitor triggered by admin', { adminId: (req as any).user?.userId });
    // Fire and forget — don't await (takes minutes)
    runVisaRulesMonitor().catch((err) => logger.error('Monitor error (manual trigger)', { error: err.message }));
    return sendSuccess(res, { message: 'Monitor started in background. Check alerts in a few minutes.' }, 'Monitor triggered');
  } catch (err: any) {
    return sendError(res, 'server_error', 'Failed to trigger monitor', 500);
  }
});

export default router;





