import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class AccountNumberService {
  // Generate customer account number
  async generateAccountNumber(userId: string, firstName: string): Promise<string> {
    // Get first 2 letters of first name (uppercase)
    const namePrefix = firstName.substring(0, 2).toUpperCase();
    
    // Generate random 5-digit number
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    
    // Create account number: MA12345
    const accountNumber = `${namePrefix}${randomNumber}`;
    
    // Check if account number already exists
    const existingAccount = await query(
      'SELECT id FROM users WHERE account_number = $1',
      [accountNumber]
    );
    
    // If exists, generate a new one
    if (existingAccount.rows.length > 0) {
      return this.generateAccountNumber(userId, firstName);
    }
    
    // If userId is provided, update user with account number
    if (userId) {
      await query(
        'UPDATE users SET account_number = $1 WHERE id = $2',
        [accountNumber, userId]
      );
    }
    
    return accountNumber;
  }

  // Get user's account number
  async getAccountNumber(userId: string): Promise<string | null> {
    const result = await query(
      'SELECT account_number FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0].account_number;
  }

  // Get account number by account number (for payment verification)
  async getAccountByNumber(accountNumber: string): Promise<any> {
    const result = await query(
      'SELECT id, email, full_name, account_number FROM users WHERE account_number = $1',
      [accountNumber]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  // Create payment instruction
  async createPaymentInstruction(
    userId: string,
    plan: string,
    billingCycle: 'monthly' | 'annual'
  ): Promise<{
    accountNumber: string;
    bankDetails: any;
    paymentInstructions: string[];
  }> {
    // Get or generate account number
    let accountNumber = await this.getAccountNumber(userId);
    if (!accountNumber) {
      const userResult = await query(
        'SELECT full_name FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        throw new AppError('User not found', 404);
      }
      
      const firstName = userResult.rows[0].full_name?.split(' ')[0] || 'User';
      accountNumber = await this.generateAccountNumber(userId, firstName);
    }

    // Store pending payment information for later verification
    await query(
      `INSERT INTO pending_payments (user_id, account_number, plan, billing_cycle, amount, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
       ON CONFLICT (account_number) 
       DO UPDATE SET plan = $3, billing_cycle = $4, amount = $5, status = 'pending', created_at = NOW()`,
      [userId, accountNumber, plan, billingCycle, this.getPlanAmount(plan, billingCycle)]
    );

    // Get plan pricing
    const { PLAN_PRICING } = await import('../config/payments');
    const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING][billingCycle];
    
    // Bank details
    const bankDetails = {
      bankName: process.env.BANK_NAME || 'First National Bank (FNB)',
      accountName: process.env.ACCOUNT_NAME || 'Immigration AI (Pty) Ltd',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
      branchCode: process.env.BANK_BRANCH_CODE || '250655',
      reference: accountNumber, // Use customer account number as reference
      amount: (amount / 100).toFixed(2),
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      billingCycle: billingCycle === 'monthly' ? 'Monthly' : 'Annual'
    };

    // Payment instructions
    const paymentInstructions = [
      `Your Account Number: ${accountNumber}`,
      `Use this as reference when making payment`,
      `Bank: ${bankDetails.bankName}`,
      `Account Name: ${bankDetails.accountName}`,
      `Account Number: ${bankDetails.accountNumber}`,
      `Branch Code: ${bankDetails.branchCode}`,
      `Amount: R${bankDetails.amount}`,
      `Reference: ${accountNumber}`,
      '',
      'Instructions:',
      '1. Use your Account Number as the reference',
      '2. Make payment from any South African bank',
      '3. Allow 2-3 business days for processing',
      '4. Your account will be activated automatically',
      '5. Keep proof of payment for your records'
    ];

    return {
      accountNumber,
      bankDetails,
      paymentInstructions
    };
  }

  // Verify payment by account number
  async verifyPaymentByAccountNumber(
    accountNumber: string,
    amount: number,
    bankReference?: string
  ): Promise<{ success: boolean; userId?: string; message: string }> {
    // Find user by account number
    const user = await this.getAccountByNumber(accountNumber);
    
    if (!user) {
      return {
        success: false,
        message: 'Account number not found'
      };
    }

    // Get pending payment information
    const pendingPayment = await query(
      'SELECT plan, billing_cycle, amount FROM pending_payments WHERE account_number = $1 AND status = $2',
      [accountNumber, 'pending']
    );

    if (pendingPayment.rows.length === 0) {
      return {
        success: false,
        message: 'No pending payment found for this account number'
      };
    }

    const { plan, billing_cycle, amount: expectedAmount } = pendingPayment.rows[0];

    // Verify amount matches (allow small variance for bank fees)
    const amountVariance = Math.abs(amount - expectedAmount);
    if (amountVariance > 1) { // Allow 1 ZAR variance
      return {
        success: false,
        message: `Amount mismatch. Expected R${expectedAmount}, received R${amount}`
      };
    }

    // Create payment record
    await query(
      `INSERT INTO payments (id, user_id, plan, billing_cycle, amount, currency, payment_method, status, transaction_id, amount_paid, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user.id,
        plan, // Use the actual plan from pending payment
        billing_cycle, // Use the actual billing cycle from pending payment
        amount * 100, // Convert to cents
        'ZAR',
        'bank_transfer',
        'completed',
        bankReference || accountNumber,
        amount * 100
      ]
    );

    // Update user subscription with the correct plan
    await this.updateUserSubscription(user.id, plan, billing_cycle);

    // Mark pending payment as completed
    await query(
      'UPDATE pending_payments SET status = $1, completed_at = NOW() WHERE account_number = $2',
      ['completed', accountNumber]
    );

    return {
      success: true,
      userId: user.id,
      message: `Payment verified and ${plan} plan activated successfully`
    };
  }

  // Get plan amount
  private getPlanAmount(plan: string, billingCycle: string): number {
    const { PLAN_PRICING } = require('../config/payments');
    return PLAN_PRICING[plan as keyof typeof PLAN_PRICING][billingCycle as 'monthly' | 'annual'];
  }

  // Map payment plan names to database plan names
  private mapPlanToDatabase(plan: string): string {
    const planMapping = {
      'starter': 'starter',
      'entry': 'entry', 
      'professional': 'professional',
      'enterprise': 'enterprise'
    };
    return planMapping[plan as keyof typeof planMapping] || 'starter';
  }

  // Update user subscription
  private async updateUserSubscription(
    userId: string,
    plan: string,
    billingCycle: string
  ): Promise<void> {
    const currentDate = new Date();
    const nextBillingDate = billingCycle === 'monthly' 
      ? new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      : new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

    // Map plan to database format
    const dbPlan = this.mapPlanToDatabase(plan);

    // Update user subscription
    await query(
      `UPDATE users 
       SET subscription_plan = $1, 
           subscription_status = 'active',
           updated_at = NOW()
       WHERE id = $2`,
      [dbPlan, userId]
    );

    // Check if subscription exists
    const existingSub = await query(
      'SELECT id FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    if (existingSub.rows.length > 0) {
      // Update existing subscription
      await query(
        `UPDATE subscriptions 
         SET plan = $1, status = $2, current_period_start = $3, current_period_end = $4, updated_at = NOW()
         WHERE user_id = $5`,
        [dbPlan, 'active', currentDate, nextBillingDate, userId]
      );
    } else {
      // Create new subscription
      await query(
        `INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, dbPlan, 'active', currentDate, nextBillingDate]
      );
    }
  }
}

export const accountNumberService = new AccountNumberService();
