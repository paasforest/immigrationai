import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Create payment (requires auth)
router.post('/create', requireAuth, paymentController.createPayment);

// Get payment methods (public)
router.get('/methods', paymentController.getPaymentMethods);

// Get account number (requires auth)
router.get('/account-number', requireAuth, paymentController.getAccountNumber);

// Verify payment by account number (public)
router.post('/verify-account', paymentController.verifyPaymentByAccount);

export default router;
