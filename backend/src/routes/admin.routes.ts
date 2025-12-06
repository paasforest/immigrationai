import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { eligibilityController } from '../controllers/eligibilityController';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

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

export default router;





