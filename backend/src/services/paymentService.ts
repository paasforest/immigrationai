import { accountNumberService } from './accountNumberService';
import { PAYMENT_METHODS, PaymentMethod } from '../config/payments';
import { AppError } from '../middleware/errorHandler';

export class PaymentService {
  // Create payment session
  async createPayment(
    userId: string,
    plan: string,
    billingCycle: 'monthly' | 'annual',
    paymentMethod: PaymentMethod,
    email: string,
    firstName: string,
    lastName: string
  ): Promise<{ accountNumber: string; bankDetails: any; paymentInstructions: string[] }> {
    switch (paymentMethod) {
      case PAYMENT_METHODS.BANK_TRANSFER:
        return await accountNumberService.createPaymentInstruction(userId, plan, billingCycle);
      
      default:
        throw new AppError('Invalid payment method', 400);
    }
  }

  // Verify payment by account number
  async verifyPaymentByAccountNumber(
    accountNumber: string,
    amount: number,
    bankReference?: string
  ): Promise<{ success: boolean; userId?: string; message: string }> {
    return await accountNumberService.verifyPaymentByAccountNumber(
      accountNumber,
      amount,
      bankReference
    );
  }

  // Get user account number (generate if doesn't exist)
  async getUserAccountNumber(userId: string): Promise<string | null> {
    let accountNumber = await accountNumberService.getAccountNumber(userId);
    
    // If account number doesn't exist, generate it
    if (!accountNumber) {
      try {
        // Get user's full name to generate account number
        const { query } = await import('../config/database');
        const userResult = await query(
          'SELECT full_name FROM users WHERE id = $1',
          [userId]
        );
        
        if (userResult.rows.length > 0) {
          const firstName = userResult.rows[0].full_name?.split(' ')[0] || 'User';
          accountNumber = await accountNumberService.generateAccountNumber(userId, firstName);
          console.log(`✅ Generated missing account number for user ${userId}: ${accountNumber}`);
        }
      } catch (error) {
        console.error(`❌ Failed to generate account number for user ${userId}:`, error);
        return null;
      }
    }
    
    return accountNumber;
  }

  // Get available payment methods
  getAvailablePaymentMethods(): { method: PaymentMethod; name: string; description: string }[] {
    return [
      {
        method: PAYMENT_METHODS.BANK_TRANSFER,
        name: 'Bank Transfer',
        description: 'Direct bank transfer using your account number (Zero fees)'
      }
    ];
  }
}

export const paymentService = new PaymentService();
