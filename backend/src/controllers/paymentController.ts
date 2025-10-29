import { Request, Response } from 'express';
import { AuthRequest } from '../types/request';
import { paymentService } from '../services/paymentService';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { PAYMENT_METHODS } from '../config/payments';

export class PaymentController {
  // POST /api/payments/create
  createPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { plan, billingCycle, paymentMethod, firstName, lastName } = req.body;

    // Validation
    if (!plan || !['starter', 'entry', 'professional', 'enterprise'].includes(plan)) {
      return sendError(res, 'VALIDATION_ERROR', 'Valid plan is required', 400);
    }

    if (!billingCycle || !['monthly', 'annual'].includes(billingCycle)) {
      return sendError(res, 'VALIDATION_ERROR', 'Valid billing cycle is required', 400);
    }

    if (!paymentMethod || !Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
      return sendError(res, 'VALIDATION_ERROR', 'Valid payment method is required', 400);
    }

    if (!firstName || !lastName) {
      return sendError(res, 'VALIDATION_ERROR', 'First name and last name are required', 400);
    }

    // Get user email
    const { query } = await import('../config/database');
    const userResult = await query('SELECT email FROM users WHERE id = $1', [req.user.userId]);
    
    if (userResult.rows.length === 0) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const email = userResult.rows[0].email;

    // Create payment
    const result = await paymentService.createPayment(
      req.user.userId,
      plan,
      billingCycle,
      paymentMethod,
      email,
      firstName,
      lastName
    );

    return sendSuccess(res, result, 'Payment created successfully');
  });

  // POST /api/payments/verify-account
  verifyPaymentByAccount = asyncHandler(async (req: Request, res: Response) => {
    const { accountNumber, amount, bankReference } = req.body;

    if (!accountNumber || !amount) {
      return sendError(res, 'VALIDATION_ERROR', 'Account number and amount are required', 400);
    }

    const result = await paymentService.verifyPaymentByAccountNumber(
      accountNumber,
      amount,
      bankReference
    );

    if (result.success) {
      return sendSuccess(res, result, 'Payment verified successfully');
    } else {
      return sendError(res, 'VERIFICATION_FAILED', result.message, 400);
    }
  });

  // GET /api/payments/account-number
  getAccountNumber = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const accountNumber = await paymentService.getUserAccountNumber(req.user.userId);
    return sendSuccess(res, { accountNumber }, 'Account number retrieved successfully');
  });

  // GET /api/payments/methods
  getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
    const methods = paymentService.getAvailablePaymentMethods();
    return sendSuccess(res, methods, 'Payment methods retrieved successfully');
  });

}

export const paymentController = new PaymentController();
