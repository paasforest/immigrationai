import { query } from '../config/database';
import { PLAN_PRICING } from '../config/payments';
import { AppError } from '../middleware/errorHandler';

export class LocalPaymentService {
  // Create bank transfer payment
  async createBankTransferPayment(
    userId: string,
    plan: string,
    billingCycle: 'monthly' | 'annual',
    email: string,
    firstName: string,
    lastName: string
  ): Promise<{ paymentId: string; bankDetails: any; reference: string }> {
    const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING][billingCycle];
    const itemName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`;
    
    // Generate unique payment ID and reference
    const paymentId = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reference = `IMMIGRATION-${paymentId}`;
    
    // Create payment record
    await query(
      `INSERT INTO payments (id, user_id, plan, billing_cycle, amount, currency, payment_method, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [paymentId, userId, plan, billingCycle, amount, 'ZAR', 'bank_transfer', 'pending']
    );

    // Bank details for payment
    const bankDetails = {
      bankName: 'First National Bank (FNB)',
      accountName: 'Immigration AI (Pty) Ltd',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
      branchCode: process.env.BANK_BRANCH_CODE || '250655',
      reference: reference,
      amount: (amount / 100).toFixed(2),
      description: itemName,
      instructions: [
        'Use the exact reference number provided',
        'Payment must be made from a South African bank account',
        'Allow 2-3 business days for processing',
        'Send proof of payment to payments@immigrationai.co.za',
        'Your account will be activated within 24 hours of payment confirmation'
      ]
    };

    return { paymentId, bankDetails, reference };
  }

  // Create EFT payment
  async createEFTPayment(
    userId: string,
    plan: string,
    billingCycle: 'monthly' | 'annual',
    email: string,
    firstName: string,
    lastName: string
  ): Promise<{ paymentId: string; eftDetails: any; reference: string }> {
    const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING][billingCycle];
    const itemName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`;
    
    // Generate unique payment ID and reference
    const paymentId = `EFT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reference = `IMMIGRATION-${paymentId}`;
    
    // Create payment record
    await query(
      `INSERT INTO payments (id, user_id, plan, billing_cycle, amount, currency, payment_method, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [paymentId, userId, plan, billingCycle, amount, 'ZAR', 'eft', 'pending']
    );

    // EFT details for payment
    const eftDetails = {
      bankName: 'First National Bank (FNB)',
      accountName: 'Immigration AI (Pty) Ltd',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
      branchCode: process.env.BANK_BRANCH_CODE || '250655',
      reference: reference,
      amount: (amount / 100).toFixed(2),
      description: itemName,
      instructions: [
        'Use the exact reference number provided',
        'EFT payments process within 2-3 business days',
        'Send proof of payment to payments@immigrationai.co.za',
        'Your account will be activated within 24 hours of payment confirmation'
      ]
    };

    return { paymentId, eftDetails, reference };
  }

  // Create Cash Deposit payment
  async createCashDepositPayment(
    userId: string,
    plan: string,
    billingCycle: 'monthly' | 'annual',
    email: string,
    firstName: string,
    lastName: string
  ): Promise<{ paymentId: string; cashDepositDetails: any; reference: string }> {
    const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING][billingCycle];
    const itemName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`;
    
    // Generate unique payment ID and reference
    const paymentId = `CASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reference = `IMMIGRATION-${paymentId}`;
    
    // Create payment record
    await query(
      `INSERT INTO payments (id, user_id, plan, billing_cycle, amount, currency, payment_method, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [paymentId, userId, plan, billingCycle, amount, 'ZAR', 'cash_deposit', 'pending']
    );

    // Cash deposit details
    const cashDepositDetails = {
      bankName: 'First National Bank (FNB)',
      accountName: 'Immigration AI (Pty) Ltd',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
      branchCode: process.env.BANK_BRANCH_CODE || '250655',
      reference: reference,
      amount: (amount / 100).toFixed(2),
      description: itemName,
      instructions: [
        'Visit any FNB branch',
        'Make a cash deposit to the account above',
        'Use the exact reference number provided',
        'Keep the deposit slip as proof',
        'Send proof of payment to payments@immigrationai.co.za',
        'Your account will be activated within 24 hours'
      ],
      branchLocations: [
        'FNB branches nationwide',
        'ATM cash deposits available',
        'Online banking cash deposits'
      ]
    };

    return { paymentId, cashDepositDetails, reference };
  }

  // Create Mobile Payment
  async createMobilePayment(
    userId: string,
    plan: string,
    billingCycle: 'monthly' | 'annual',
    email: string,
    firstName: string,
    lastName: string
  ): Promise<{ paymentId: string; mobilePaymentDetails: any; reference: string }> {
    const amount = PLAN_PRICING[plan as keyof typeof PLAN_PRICING][billingCycle];
    const itemName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`;
    
    // Generate unique payment ID and reference
    const paymentId = `MOBILE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reference = `IMMIGRATION-${paymentId}`;
    
    // Create payment record
    await query(
      `INSERT INTO payments (id, user_id, plan, billing_cycle, amount, currency, payment_method, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [paymentId, userId, plan, billingCycle, amount, 'ZAR', 'mobile_payment', 'pending']
    );

    // Mobile payment details
    const mobilePaymentDetails = {
      bankName: 'First National Bank (FNB)',
      accountName: 'Immigration AI (Pty) Ltd',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
      branchCode: process.env.BANK_BRANCH_CODE || '250655',
      reference: reference,
      amount: (amount / 100).toFixed(2),
      description: itemName,
      instructions: [
        'Use your mobile banking app',
        'Transfer to the account details above',
        'Use the exact reference number provided',
        'Screenshot the confirmation',
        'Send proof of payment to payments@immigrationai.co.za',
        'Your account will be activated within 24 hours'
      ],
      supportedApps: [
        'FNB App', 'Standard Bank App', 'ABSA App', 'Nedbank App', 'Capitec App'
      ]
    };

    return { paymentId, mobilePaymentDetails, reference };
  }

  // Verify payment proof (manual verification)
  async verifyPaymentProof(
    paymentId: string,
    proofData: {
      bankReference: string;
      amount: number;
      paymentDate: string;
      bankName: string;
    }
  ): Promise<boolean> {
    try {
      // Update payment record with proof
      await query(
        `UPDATE payments 
         SET status = 'verifying', 
             transaction_id = $1,
             amount_paid = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [proofData.bankReference, proofData.amount * 100, paymentId]
      );

      // TODO: Implement manual verification process
      // This would typically involve:
      // 1. Sending notification to admin
      // 2. Admin verifying the payment
      // 3. Updating payment status to 'completed'
      // 4. Activating user subscription

      return true;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  // Get payment instructions
  getPaymentInstructions(paymentMethod: string): string[] {
    const instructions = {
      bank_transfer: [
        'Make payment to the provided bank account',
        'Use the exact reference number provided',
        'Payment must be made from a South African bank account',
        'Allow 2-3 business days for processing',
        'Send proof of payment to payments@immigrationai.co.za',
        'Your account will be activated within 24 hours of payment confirmation'
      ],
      eft: [
        'Use the exact reference number provided',
        'EFT payments process within 2-3 business days',
        'Send proof of payment to payments@immigrationai.co.za',
        'Your account will be activated within 24 hours of payment confirmation'
      ],
      instant_eft: [
        'Instant EFT via PayFast',
        'Supports all major South African banks',
        'Payment processes immediately',
        'Your account will be activated instantly after payment'
      ]
    };

    return instructions[paymentMethod as keyof typeof instructions] || [];
  }
}

export const localPaymentService = new LocalPaymentService();
