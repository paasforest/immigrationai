import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext, organizationContextAllowExpired } from '../middleware/organizationContext';
import {
  getSubscriptionDetails,
  getPlans,
  initiatePayment,
  handlePaymentWebhook,
  cancelSubscription,
  getBillingUsage,
} from '../controllers/billingController';

const router = Router();

// Get subscription details — allow expired trial so user can see billing page
router.get('/subscription', auth, organizationContextAllowExpired, getSubscriptionDetails);

// Get available plans (public, but auth recommended)
router.get('/plans', auth, getPlans);

// Initiate payment — allow expired trial so user can submit EFT reference
router.post('/initiate', auth, organizationContextAllowExpired, initiatePayment);

// Payment webhook (no auth - called by payment provider)
router.post('/webhook', handlePaymentWebhook);

// Get billing usage — allow expired trial
router.get('/usage', auth, getBillingUsage);

// Cancel subscription (requires auth + org context)
router.delete('/cancel', auth, organizationContext, cancelSubscription);export default router;