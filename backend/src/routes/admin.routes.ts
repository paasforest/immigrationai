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
router.post('/payments/:paymentId/verify', adminController.verifyPayment);
router.post('/payments/:paymentId/reject', adminController.rejectPayment);

export default router;





