import { stripe, STRIPE_PLANS } from '../config/stripe';
import { databaseService } from './databaseService';
import { AppError } from '../middleware/errorHandler';
import { openaiService } from './openaiService';
import { getSubscriptionLimits } from '../utils/helpers';
import { query } from '../config/database';

export class BillingService {
  // Create Stripe checkout session
  async createCheckoutSession(
    userId: string,
    plan: 'starter' | 'entry' | 'professional' | 'enterprise',
    billingCycle: 'monthly' | 'annual',
    email: string
  ): Promise<{ sessionId: string; url: string }> {
    // Get or create Stripe customer
    let customerId = await this.getStripeCustomerId(userId);

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
      
      // Save customer ID
      await query(
        'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, userId]
      );
    }

    // Determine price ID based on plan and billing cycle
    const priceId = this.getPriceId(plan, billingCycle);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId,
        plan,
        billingCycle,
      },
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  }

  // Create customer portal session
  async createPortalSession(userId: string): Promise<{ url: string }> {
    const customerId = await this.getStripeCustomerId(userId);

    if (!customerId) {
      throw new AppError('No active subscription found', 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    return {
      url: session.url,
    };
  }

  // Handle Stripe webhook
  async handleWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }

  // Get user's usage and limits
  async getUserUsage(userId: string): Promise<any> {
    // Get user's plan and organizationId
    const userResult = await query(
      'SELECT subscription_plan, subscription_status, organization_id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const { subscription_plan, subscription_status, organization_id } = userResult.rows[0];

    // Get usage (graceful fallback if api_usage has no rows)
    let usage = { documents: 0, tokensUsed: 0, costUsd: 0 };
    try {
      usage = await openaiService.getUserMonthlyUsage(userId);
    } catch (_) {}

    // Get limits
    const limits = getSubscriptionLimits(subscription_plan);

    // Get subscription details — subscriptions table uses organization_id
    let subscription = null;
    try {
      if (organization_id) {
        const subResult = await query(
          'SELECT * FROM subscriptions WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
          [organization_id]
        );
        subscription = subResult.rows[0] || null;
      }
    } catch (_) {}

    return {
      currentUsage: {
        documents: usage.documents,
        tokensUsed: usage.tokensUsed,
      },
      limits: {
        documents: limits.documentsPerMonth,
        tokensPerMonth: limits.tokensPerMonth,
      },
      subscription: {
        plan: subscription_plan,
        status: subscription_status,
        currentPeriodEnd: subscription?.current_period_end || null,
        stripeSubscriptionId: subscription?.stripe_subscription_id || null,
      },
    };
  }

  // Private helper methods

  private async getStripeCustomerId(userId: string): Promise<string | null> {
    const result = await query(
      'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    return result.rows[0]?.stripe_customer_id || null;
  }

  private getPriceId(plan: string, billingCycle: string): string {
    const planKey = `${plan}_${billingCycle}`;
    return STRIPE_PLANS[planKey as keyof typeof STRIPE_PLANS] || STRIPE_PLANS.starter_monthly;
  }

  private async handleCheckoutComplete(session: any): Promise<void> {
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update or create subscription record
    await query(
      `INSERT INTO subscriptions 
       (user_id, plan, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end)
       VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7))
       ON CONFLICT (stripe_subscription_id) 
       DO UPDATE SET status = $5, current_period_start = to_timestamp($6), current_period_end = to_timestamp($7)`,
      [
        userId,
        plan,
        subscriptionId,
        customerId,
        subscription.status,
        subscription.current_period_start,
        subscription.current_period_end,
      ]
    );

    // Update user's subscription plan
    await query(
      'UPDATE users SET subscription_plan = $1, subscription_status = $2 WHERE id = $3',
      [plan, subscription.status, userId]
    );
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    await query(
      `UPDATE subscriptions 
       SET status = $1, current_period_start = to_timestamp($2), current_period_end = to_timestamp($3)
       WHERE stripe_subscription_id = $4`,
      [
        subscription.status,
        subscription.current_period_start,
        subscription.current_period_end,
        subscription.id,
      ]
    );

    // Update user status
    const subResult = await query(
      'SELECT user_id, plan FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    );

    if (subResult.rows.length > 0) {
      await query(
        'UPDATE users SET subscription_status = $1 WHERE id = $2',
        [subscription.status, subResult.rows[0].user_id]
      );
    }
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    await query(
      `UPDATE subscriptions SET status = 'cancelled' WHERE stripe_subscription_id = $1`,
      [subscription.id]
    );

    // Downgrade user to free plan
    const subResult = await query(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    );

    if (subResult.rows.length > 0) {
      await query(
        `UPDATE users SET subscription_plan = 'starter', subscription_status = 'cancelled' WHERE id = $1`,
        [subResult.rows[0].user_id]
      );
    }
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    // Log successful payment
    console.log('Payment succeeded:', invoice.id);
    // TODO: Send receipt email
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    // Log failed payment
    console.error('Payment failed:', invoice.id);
    // TODO: Send payment failure email
    
    // Update subscription status
    if (invoice.subscription) {
      await query(
        `UPDATE subscriptions SET status = 'past_due' WHERE stripe_subscription_id = $1`,
        [invoice.subscription]
      );
    }
  }
}

export const billingService = new BillingService();


