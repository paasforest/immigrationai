import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  getSubscriptionDetails,
  getPlans,
  initiatePayment,
  handlePaymentWebhook,
  cancelSubscription,
} from '../controllers/billingController';

const router = Router();

// Get subscription details (requires auth + org context)
router.get('/subscription', auth, organizationContext, getSubscriptionDetails);

// Get available plans (public, but auth recommended)
router.get('/plans', auth, getPlans);

// Initiate payment (requires auth + org context)
router.post('/initiate', auth, organizationContext, initiatePayment);

// Payment webhook (no auth - called by payment provider)
router.post('/webhook', handlePaymentWebhook);

// Cancel subscription (requires auth + org context)
router.delete('/cancel', auth, organizationContext, cancelSubscription);export default router;