import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * Get current subscription details
 */
export async function getSubscriptionDetails(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;

    // Get organization with subscription
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscriptions: {
          where: {
            status: { in: ['active', 'trial', 'cancelled'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    const subscription = organization.subscriptions[0] || null;

    // Calculate days remaining
    let daysRemaining: number | null = null;
    if (subscription) {
      const now = new Date();
      const endDate = subscription.currentPeriodEnd || subscription.trialEndsAt;
      if (endDate) {
        const diff = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }
    }

    // Get recent invoices (placeholder - would come from payment provider)
    const invoices: any[] = [];

    res.json({
      success: true,
      data: {
        plan: organization.plan,
        status: organization.planStatus,
        amount: subscription?.amount || 0,
        currency: subscription?.currency || 'ZAR',
        billingCycle: subscription?.billingCycle || 'monthly',
        currentPeriodStart: subscription?.currentPeriodStart || null,
        currentPeriodEnd: subscription?.currentPeriodEnd || subscription?.trialEndsAt || null,
        daysRemaining,
        paymentMethod: subscription?.paymentMethod || null,
        invoices,
      },
      message: 'Subscription details retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to get subscription details', 500);
  }
}

/**
 * Get available plans
 */
export async function getPlans(req: Request, res: Response): Promise<void> {
  try {
    const plans = [
      {
        id: 'starter',
        name: 'Starter',
        price: 299,
        priceAnnual: 2870, // 299 * 12 * 0.8 (20% discount)
        currency: 'ZAR',
        features: [
          '10 active cases',
          '2 team members',
          'Case management',
          'Document upload',
          'Basic checklists',
          'Client portal',
        ],
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 699,
        priceAnnual: 6710, // 699 * 12 * 0.8
        currency: 'ZAR',
        popular: true,
        features: [
          '50 active cases',
          '5 team members',
          'Everything in Starter',
          'AI checklist generation',
          'Financial assistant',
          'Priority support',
          'Advanced reporting',
        ],
      },
      {
        id: 'agency',
        name: 'Agency',
        price: 1499,
        priceAnnual: 14390, // 1499 * 12 * 0.8
        currency: 'ZAR',
        features: [
          'Unlimited cases',
          'Unlimited team members',
          'Everything in Professional',
          'Custom branding',
          'API access',
          'Dedicated account manager',
          'SLA guarantee',
        ],
      },
    ];

    res.json({
      success: true,
      data: plans,
      message: 'Plans retrieved successfully',
    });
  } catch (error: any) {
    throw new AppError(error.message || 'Failed to get plans', 500);
  }
}

/**
 * Initiate payment
 */
export async function initiatePayment(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const { plan, paymentMethod, billingCycle } = req.body;

    if (!plan || !paymentMethod || !billingCycle) {
      throw new AppError('Plan, payment method, and billing cycle are required', 400);
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    // Get plan pricing
    const plans = await getPlans(req, res);
    // Note: This won't work as written, need to refactor
    const planData = {
      starter: { price: 299 },
      professional: { price: 699 },
      agency: { price: 1499 },
    }[plan];

    if (!planData) {
      throw new AppError('Invalid plan', 400);
    }

    const amount = billingCycle === 'annual' 
      ? Math.round(planData.price * 12 * 0.8) // 20% discount
      : planData.price;

    // Handle different payment methods
    if (paymentMethod === 'bank_transfer') {
      // Return banking details
      const bankDetails = {
        bank: 'Standard Bank',
        accountNumber: '1234567890',
        accountName: 'Immigration AI',
        reference: organizationId.substring(0, 8).toUpperCase(),
      };

      // Create pending subscription
      await prisma.subscription.create({
        data: {
          organizationId,
          plan,
          status: 'pending',
          amount,
          currency: 'ZAR',
          billingCycle,
          paymentMethod: 'bank_transfer',
        },
      });

      res.json({
        success: true,
        data: {
          bankDetails,
        },
        message: 'Banking details provided',
      });
      return;
    }

    // For PayFast, Yoco, Stripe - generate payment URLs
    // These are placeholders - integrate with actual payment providers
    let paymentUrl: string | null = null;
    let clientSecret: string | null = null;

    if (paymentMethod === 'payfast') {
      // PayFast integration would go here
      paymentUrl = `https://sandbox.payfast.co.za/eng/process?merchant_id=${process.env.PAYFAST_MERCHANT_ID}&merchant_key=${process.env.PAYFAST_MERCHANT_KEY}&amount=${amount}&item_name=${plan} Plan`;
    } else if (paymentMethod === 'yoco') {
      // Yoco integration would go here
      paymentUrl = `https://payments.yoco.com/checkout?amount=${amount}&plan=${plan}`;
    } else if (paymentMethod === 'stripe') {
      // Stripe integration would go here
      // Would create payment intent and return client secret
      clientSecret = 'placeholder_stripe_secret';
    }

    res.json({
      success: true,
      data: {
        paymentUrl,
        clientSecret,
      },
      message: 'Payment initiated',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to initiate payment', 500);
  }
}

/**
 * Handle payment webhook
 */
export async function handlePaymentWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { paymentProvider, paymentId, organizationId, amount, status } = req.body;

    if (!paymentProvider || !paymentId || !organizationId) {
      throw new AppError('Invalid webhook data', 400);
    }

    // Find organization
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    if (status === 'paid' || status === 'success') {
      // Update subscription to active
      const subscription = await prisma.subscription.findFirst({
        where: {
          organizationId,
          status: 'pending',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (subscription) {
        const now = new Date();
        const endDate = new Date();
        if (subscription.billingCycle === 'annual') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
            paymentMethod: paymentProvider,
          },
        });

        // Update organization plan status
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            plan: subscription.plan,
            planStatus: 'active',
          },
        });
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to process webhook', 500);
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId,
        status: { in: ['active', 'trial'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new AppError('No active subscription found', 404);
    }

    // Set cancellation date
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'subscription_cancelled',
        resourceType: 'subscription',
        resourceId: subscription.id,
      },
    });    res.json({
      success: true,
      message: 'Subscription cancelled successfully. Access continues until period end.',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to cancel subscription', 500);
  }
}