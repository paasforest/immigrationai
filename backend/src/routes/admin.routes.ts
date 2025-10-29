import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// Payment management
router.get('/payments/pending', adminController.getPendingPayments);
router.get('/payments/stats', adminController.getPaymentStats);
router.get('/payments/search/:accountNumber', adminController.searchPaymentsByAccount);
router.post('/payments/:paymentId/verify', adminController.verifyPayment);
router.post('/payments/:paymentId/reject', adminController.rejectPayment);

export default router;





