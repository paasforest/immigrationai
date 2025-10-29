import { Router } from 'express';
import { billingController } from '../controllers/billingController';
import { authenticateJWT } from '../middleware/auth';
import express from 'express';

const router = Router();

// Webhook route (raw body required for Stripe signature verification)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  billingController.handleWebhook
);

// Protected routes (require authentication)
router.post('/checkout', authenticateJWT, billingController.createCheckoutSession);
router.get('/portal', authenticateJWT, billingController.createPortalSession);
router.get('/usage', authenticateJWT, billingController.getUserUsage);

export default router;


