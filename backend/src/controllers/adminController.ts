import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { paymentVerificationService } from '../services/paymentVerificationService';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';

export class AdminController {
  // GET /api/admin/payments/pending
  getPendingPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    // Admin role check is handled by requireAdmin middleware in routes
    const payments = await paymentVerificationService.getPendingPayments();
    return sendSuccess(res, payments, 'Pending payments retrieved successfully');
  });

  // POST /api/admin/payments/:paymentId/verify
  verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { paymentId } = req.params;
    const { notes } = req.body;

    if (!paymentId) {
      return sendError(res, 'VALIDATION_ERROR', 'Payment ID is required', 400);
    }

    const result = await paymentVerificationService.verifyPayment(
      paymentId,
      req.user.userId,
      notes
    );

    if (result.success) {
      return sendSuccess(res, result, 'Payment verified successfully');
    } else {
      return sendError(res, 'VERIFICATION_FAILED', result.message, 400);
    }
  });

  // POST /api/admin/payments/:paymentId/reject
  rejectPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { paymentId } = req.params;
    const { reason } = req.body;

    if (!paymentId || !reason) {
      return sendError(res, 'VALIDATION_ERROR', 'Payment ID and reason are required', 400);
    }

    const result = await paymentVerificationService.rejectPayment(
      paymentId,
      req.user.userId,
      reason
    );

    if (result.success) {
      return sendSuccess(res, result, 'Payment rejected successfully');
    } else {
      return sendError(res, 'REJECTION_FAILED', result.message, 400);
    }
  });

  // GET /api/admin/payments/stats
  getPaymentStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const stats = await paymentVerificationService.getPaymentStats();
    return sendSuccess(res, stats, 'Payment statistics retrieved successfully');
  });

  // GET /api/admin/payments/search/:accountNumber
  searchPaymentsByAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { accountNumber } = req.params;

    if (!accountNumber) {
      return sendError(res, 'VALIDATION_ERROR', 'Account number is required', 400);
    }

    const payments = await paymentVerificationService.searchPaymentsByAccount(accountNumber);
    return sendSuccess(res, payments, 'Payments retrieved successfully');
  });
}

export const adminController = new AdminController();





