import { Router } from 'express';
import { adminController } from '../controllers/adminController';
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

export default router;





