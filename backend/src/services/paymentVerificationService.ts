import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class PaymentVerificationService {
  // Get pending payments for manual verification
  async getPendingPayments(): Promise<any[]> {
    const result = await query(
      `SELECT 
        p.id,
        p.user_id,
        p.plan,
        p.billing_cycle,
        p.amount,
        p.created_at,
        u.email,
        u.full_name,
        u.account_number
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.status = 'pending'
       ORDER BY p.created_at DESC`
    );

    return result.rows;
  }

  // Verify payment manually
  async verifyPayment(
    paymentId: string,
    verifiedBy: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get payment details
      const paymentResult = await query(
        'SELECT * FROM payments WHERE id = $1',
        [paymentId]
      );

      if (paymentResult.rows.length === 0) {
        return { success: false, message: 'Payment not found' };
      }

      const payment = paymentResult.rows[0];

      // Update payment status
      await query(
        `UPDATE payments 
         SET status = 'completed', 
             verified_by = $1,
             verification_notes = $2,
             verified_at = NOW(),
             updated_at = NOW()
         WHERE id = $3`,
        [verifiedBy, notes || '', paymentId]
      );

      // Update user subscription
      await this.updateUserSubscription(
        payment.user_id,
        payment.plan,
        payment.billing_cycle
      );

      return { success: true, message: 'Payment verified and account activated' };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, message: 'Failed to verify payment' };
    }
  }

  // Reject payment
  async rejectPayment(
    paymentId: string,
    rejectedBy: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Update payment status
      await query(
        `UPDATE payments 
         SET status = 'rejected', 
             verified_by = $1,
             verification_notes = $2,
             verified_at = NOW(),
             updated_at = NOW()
         WHERE id = $3`,
        [rejectedBy, reason, paymentId]
      );

      return { success: true, message: 'Payment rejected' };
    } catch (error) {
      console.error('Payment rejection error:', error);
      return { success: false, message: 'Failed to reject payment' };
    }
  }

  // Get payment statistics
  async getPaymentStats(): Promise<any> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue
       FROM payments`
    );

    return result.rows[0];
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

  // Search payments by account number
  async searchPaymentsByAccount(accountNumber: string): Promise<any[]> {
    const result = await query(
      `SELECT 
        p.id,
        p.plan,
        p.billing_cycle,
        p.amount,
        p.status,
        p.created_at,
        u.email,
        u.full_name,
        u.account_number
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE u.account_number = $1
       ORDER BY p.created_at DESC`,
      [accountNumber]
    );

    return result.rows;
  }
}

export const paymentVerificationService = new PaymentVerificationService();





