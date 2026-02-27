import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { PLAN_PRICING } from '../config/payments';

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
      const endDate = subscription.currentPeriodEnd || (subscription as any).trialEndsAt;
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
        currentPeriodEnd: subscription?.currentPeriodEnd || (subscription as any)?.trialEndsAt || null,
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
    const { plan, billingCycle } = req.body;
    // paymentMethod is always bank_transfer/EFT for now
    const paymentMethod = 'bank_transfer';

    if (!plan || !billingCycle) {
      throw new AppError('Plan and billing cycle are required', 400);
    }

    if (!PLAN_PRICING[plan as keyof typeof PLAN_PRICING]) {
      throw new AppError('Invalid plan', 400);
    }

    const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING][billingCycle as 'monthly' | 'annual'];

    // ── Get or generate customer account number ──────────────────────────────
    // Account number is used as the EFT payment reference (e.g. "MA12345")
    let accountNumber = user.accountNumber as string | null | undefined;

    if (!accountNumber) {
      // Look up from DB
      const userRecord = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { accountNumber: true, fullName: true },
      });
      accountNumber = userRecord?.accountNumber ?? null;

      if (!accountNumber) {
        // Generate a new one: first 2 letters of name + 5 digits
        const firstName = (userRecord?.fullName || 'US').trim().split(' ')[0];
        const prefix = firstName.substring(0, 2).toUpperCase();
        let candidate = `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;
        // Ensure uniqueness
        while (await prisma.user.findFirst({ where: { accountNumber: candidate } })) {
          candidate = `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;
        }
        await prisma.user.update({ where: { id: user.userId }, data: { accountNumber: candidate } });
        accountNumber = candidate;
      }
    }

    // ── Upsert pending payment record ────────────────────────────────────────
    await prisma.pendingPayment.upsert({
      where: { accountNumber },
      update: { plan, billingCycle, amount, status: 'pending' },
      create: {
        userId: user.userId,
        accountNumber,
        plan,
        billingCycle,
        amount,
        status: 'pending',
      },
    });

    // ── Create / update pending subscription ─────────────────────────────────
    const existingSub = await prisma.subscription.findFirst({
      where: { organizationId, status: { in: ['pending', 'trial'] } },
      orderBy: { createdAt: 'desc' },
    });

    if (existingSub) {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: { plan, billingCycle, amount, paymentMethod, status: 'pending' },
      });
    } else {
      await prisma.subscription.create({
        data: { organizationId, plan, billingCycle, amount, currency: 'ZAR', paymentMethod, status: 'pending' },
      });
    }

    // ── Bank details to return to frontend ───────────────────────────────────
    const bankDetails = {
      bank: process.env.BANK_NAME || 'ABSA Bank',
      accountName: process.env.ACCOUNT_NAME || 'ImmigrationAI',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '4115223741',
      branchCode: process.env.BANK_BRANCH_CODE || '632005',
      reference: accountNumber,           // ← customer uses their account number as reference
      amount: (amount / 100).toFixed(2),  // PLAN_PRICING stores cents
      amountRaw: amount,
      plan: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan – ${billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`,
      instructions: [
        `Use "${accountNumber}" as the payment reference`,
        'Make an EFT / internet banking transfer to the account above',
        'Allow 1–2 business days for manual verification',
        'Upload your proof of payment below to speed up activation',
        'Questions? Email payments@immigrationai.co.za',
      ],
    };

    res.json({
      success: true,
      data: { bankDetails, accountNumber },
      message: 'EFT banking details generated',
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
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