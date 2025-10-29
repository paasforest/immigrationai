import * as crypto from 'crypto';
import { payfastConfig, PLAN_PRICING } from '../config/payments';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class PayFastService {
  // Generate PayFast payment URL
  async createPayment(
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
    const paymentId = `PF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment record
    await query(
      `INSERT INTO payments (id, user_id, plan, billing_cycle, amount, currency, payment_method, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [paymentId, userId, plan, billingCycle, amount, 'ZAR', 'payfast', 'pending']
    );

    // PayFast parameters
    const data = {
      merchant_id: payfastConfig.merchantId,
      merchant_key: payfastConfig.merchantKey,
      return_url: payfastConfig.returnUrl,
      cancel_url: payfastConfig.cancelUrl,
      notify_url: payfastConfig.notifyUrl,
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      m_payment_id: paymentId,
      amount: (amount / 100).toFixed(2), // PayFast expects amount in Rands
      item_name: itemName,
      item_description: `Immigration AI ${itemName} subscription`,
      custom_str1: userId,
      custom_str2: plan,
      custom_str3: billingCycle,
    };

    // Generate signature
    const signature = this.generateSignature(data);
    (data as any).signature = signature;

    // Build payment URL
    const baseUrl = payfastConfig.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process' 
      : 'https://www.payfast.co.za/eng/process';
    
    const paymentUrl = this.buildPaymentUrl(baseUrl, data);

    return { paymentUrl, paymentId };
  }

  // Verify PayFast ITN (Instant Transaction Notification)
  async verifyITN(data: any): Promise<boolean> {
    // Remove signature from data for verification
    const { signature, ...dataToVerify } = data;
    
    // Generate expected signature
    const expectedSignature = this.generateSignature(dataToVerify);
    
    return signature === expectedSignature;
  }

  // Handle PayFast payment notification
  async handlePaymentNotification(data: any): Promise<void> {
    const isValid = await this.verifyITN(data);
    
    if (!isValid) {
      throw new AppError('Invalid PayFast signature', 400);
    }

    const paymentId = data.m_payment_id;
    const status = data.payment_status;
    const amount = parseFloat(data.amount_gross);

    // Update payment record
    await query(
      `UPDATE payments 
       SET status = $1, 
           transaction_id = $2, 
           amount_paid = $3, 
           updated_at = NOW()
       WHERE id = $4`,
      [status, data.pf_payment_id, amount * 100, paymentId] // Convert back to cents
    );

    if (status === 'COMPLETE') {
      // Get payment details
      const paymentResult = await query(
        'SELECT user_id, plan, billing_cycle FROM payments WHERE id = $1',
        [paymentId]
      );

      if (paymentResult.rows.length > 0) {
        const { user_id, plan, billing_cycle } = paymentResult.rows[0];
        
        // Update user subscription
        await this.updateUserSubscription(user_id, plan, billing_cycle);
      }
    }
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

  // Generate PayFast signature
  private generateSignature(data: any): string {
    // Remove empty values and signature
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '' && value !== null)
    );

    // Create query string
    const queryString = Object.keys(filteredData)
      .sort()
      .map(key => `${key}=${encodeURIComponent(String(filteredData[key]))}`)
      .join('&');

    // Add passphrase
    const stringToSign = queryString + (payfastConfig.passphrase ? `&passphrase=${payfastConfig.passphrase}` : '');

    // Generate MD5 hash
    return crypto.createHash('md5').update(stringToSign).digest('hex');
  }

  // Build payment URL with parameters
  private buildPaymentUrl(baseUrl: string, data: any): string {
    const params = new URLSearchParams();
    
    Object.keys(data).forEach(key => {
      if (data[key] !== '' && data[key] !== null) {
        params.append(key, data[key]);
      }
    });

    return `${baseUrl}?${params.toString()}`;
  }
}

export const payfastService = new PayFastService();
