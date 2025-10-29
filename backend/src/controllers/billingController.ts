import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { billingService } from '../services/billingService';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { stripe } from '../config/stripe';
import { STRIPE_WEBHOOK_SECRET } from '../config/stripe';

export class BillingController {
  // POST /api/billing/checkout
  createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { plan, billingCycle } = req.body;

    if (!plan || !['starter', 'entry', 'professional', 'enterprise'].includes(plan)) {
      return sendError(res, 'VALIDATION_ERROR', 'Valid plan is required', 400);
    }

    if (!billingCycle || !['monthly', 'annual'].includes(billingCycle)) {
      return sendError(res, 'VALIDATION_ERROR', 'Valid billing cycle is required (monthly or annual)', 400);
    }

    // Get user email
    const { query } = await import('../config/database');
    const userResult = await query('SELECT email FROM users WHERE id = $1', [req.user.userId]);
    
    if (userResult.rows.length === 0) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const email = userResult.rows[0].email;

    const session = await billingService.createCheckoutSession(req.user.userId, plan, billingCycle, email);

    return sendSuccess(res, session, 'Checkout session created successfully');
  });

  // GET /api/billing/portal
  createPortalSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const portal = await billingService.createPortalSession(req.user.userId);

    return sendSuccess(res, portal, 'Portal session created successfully');
  });

  // GET /api/billing/usage
  getUserUsage = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const usage = await billingService.getUserUsage(req.user.userId);

    return sendSuccess(res, usage, 'Usage retrieved successfully');
  });

  // POST /api/billing/webhook
  handleWebhook = asyncHandler(async (req: any, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return sendError(res, 'WEBHOOK_ERROR', 'No signature provided', 400);
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_WEBHOOK_SECRET
      );

      await billingService.handleWebhook(event);

      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      return sendError(res, 'WEBHOOK_ERROR', error.message, 400);
    }
  });
}

export const billingController = new BillingController();


