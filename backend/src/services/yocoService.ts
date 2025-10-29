import axios from 'axios';
import crypto from 'crypto';
import { query } from '../config/database';
import { PLAN_PRICING } from '../config/payments';
import { AppError } from '../middleware/errorHandler';

export class YocoService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.YOCO_API_KEY || '';
    this.secretKey = process.env.YOCO_SECRET_KEY || '';
    this.webhookSecret = process.env.YOCO_WEBHOOK_SECRET || '';
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.yoco.com/v1' 
      : 'https://api-sandbox.yoco.com/v1';
  }

  // Create payment session
  async createPaymentSession(
    userId: string,
    plan: string,
    billingCycle: 'monthly' | 'annual',
    email: string,
    firstName: string,
    lastName: string
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING][billingCycle];
    const itemName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`;
    
    // Generate unique payment ID
    const paymentId = `YOCO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment record
    await query(
      `INSERT INTO payments (id, user_id, plan, billing_cycle, amount, currency, payment_method, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [paymentId, userId, plan, billingCycle, amount, 'ZAR', 'yoco', 'pending']
    );

    try {
      // Create Yoco payment session
      const response = await axios.post(
        `${this.baseUrl}/charges`,
        {
          amount: amount, // Amount in cents
          currency: 'ZAR',
          description: itemName,
          metadata: {
            userId,
            plan,
            billingCycle,
            paymentId
          },
          successUrl: `${process.env.FRONTEND_URL}/payment/success?payment_id=${paymentId}`,
          cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel?payment_id=${paymentId}`,
          webhookUrl: `${process.env.BACKEND_URL}/api/payments/yoco/webhook`,
          customer: {
            email,
            firstName,
            lastName
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const paymentUrl = response.data.paymentUrl;
      
      // Update payment record with Yoco charge ID
      await query(
        'UPDATE payments SET transaction_id = $1 WHERE id = $2',
        [response.data.id, paymentId]
      );

      return { paymentUrl, paymentId };
    } catch (error: any) {
      console.error('Yoco payment creation error:', error.response?.data || error.message);
      throw new AppError('Failed to create payment session', 500);
    }
  }

  // Verify webhook signature
  private verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  // Handle webhook notification
  async handleWebhook(payload: string, signature: string): Promise<void> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new AppError('Invalid webhook signature', 400);
    }

    const data = JSON.parse(payload);
    const { type, data: eventData } = data;

    if (type === 'charge.succeeded') {
      await this.handleSuccessfulPayment(eventData);
    } else if (type === 'charge.failed') {
      await this.handleFailedPayment(eventData);
    }
  }

  // Handle successful payment
  private async handleSuccessfulPayment(chargeData: any): Promise<void> {
    const chargeId = chargeData.id;
    const amount = chargeData.amount;
    const metadata = chargeData.metadata;

    // Find payment record
    const paymentResult = await query(
      'SELECT * FROM payments WHERE transaction_id = $1',
      [chargeId]
    );

    if (paymentResult.rows.length === 0) {
      console.error('Payment not found for charge ID:', chargeId);
      return;
    }

    const payment = paymentResult.rows[0];

    // Update payment status
    await query(
      `UPDATE payments 
       SET status = 'completed', 
           amount_paid = $1, 
           updated_at = NOW()
       WHERE id = $2`,
      [amount, payment.id]
    );

    // Update user subscription
    await this.updateUserSubscription(
      payment.user_id, 
      payment.plan, 
      payment.billing_cycle
    );

    console.log('Payment completed successfully:', payment.id);
  }

  // Handle failed payment
  private async handleFailedPayment(chargeData: any): Promise<void> {
    const chargeId = chargeData.id;

    // Find payment record
    const paymentResult = await query(
      'SELECT * FROM payments WHERE transaction_id = $1',
      [chargeId]
    );

    if (paymentResult.rows.length === 0) {
      console.error('Payment not found for charge ID:', chargeId);
      return;
    }

    const payment = paymentResult.rows[0];

    // Update payment status
    await query(
      `UPDATE payments 
       SET status = 'failed', 
           updated_at = NOW()
       WHERE id = $1`,
      [payment.id]
    );

    console.log('Payment failed:', payment.id);
  }

  // Update user subscription after successful payment
  private async updateUserSubscription(
    userId: string, 
    plan: string, 
    billingCycle: string
  ): Promise<void> {
    const currentDate = new Date();
    const nextBillingDate = billingCycle === 'monthly' 
      ? new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      : new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

    // Update user subscription
    await query(
      `UPDATE users 
       SET subscription_plan = $1, 
           subscription_status = 'active',
           updated_at = NOW()
       WHERE id = $2`,
      [plan, userId]
    );

    // Create/update subscription record
    await query(
      `INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         plan = $2,
         status = $3,
         current_period_start = $4,
         current_period_end = $5,
         updated_at = NOW()`,
      [userId, plan, 'active', currentDate, nextBillingDate]
    );
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<any> {
    const result = await query(
      'SELECT * FROM payments WHERE id = $1',
      [paymentId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Payment not found', 404);
    }

    return result.rows[0];
  }
}

export const yocoService = new YocoService();

