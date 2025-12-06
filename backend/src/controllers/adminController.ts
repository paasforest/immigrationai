import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { paymentVerificationService } from '../services/paymentVerificationService';
import { accountNumberService } from '../services/accountNumberService';
import { trackingService } from '../services/trackingService';
import { getRecentSessions as getRecentSessionsService, getSessionStats as getSessionStatsService } from '../services/sessionService';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../config/prisma';

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

  // GET /api/admin/analytics/utm
  getUTMAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { startDate, endDate } = req.query;
    
    const analytics = await trackingService.getTrackingAnalytics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    return sendSuccess(res, analytics, 'UTM analytics retrieved successfully');
  });

  // GET /api/admin/analytics/utm/sources
  getUTMSources = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const analytics = await trackingService.getTrackingAnalytics();
    return sendSuccess(res, analytics.bySource, 'UTM sources retrieved successfully');
  });

  // GET /api/admin/analytics/utm/campaigns
  getUTMCampaigns = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const analytics = await trackingService.getTrackingAnalytics();
    return sendSuccess(res, analytics.byCampaign, 'UTM campaigns retrieved successfully');
  });

  // GET /api/admin/analytics/utm/conversions
  getUTMConversions = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const analytics = await trackingService.getTrackingAnalytics();
    return sendSuccess(res, analytics.totals, 'UTM conversions retrieved successfully');
  });

  // GET /api/admin/analytics/utm/sessions
  getRecentSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }
    const limit = Number(req.query.limit || 50);
    const sessions = await getRecentSessionsService(limit);
    return sendSuccess(res, sessions, 'Recent sessions retrieved successfully');
  });

  // GET /api/admin/analytics/utm/session-stats
  getSessionStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }
    const stats = await getSessionStatsService();
    return sendSuccess(res, stats, 'Session stats retrieved successfully');
  });

  // POST /api/admin/payments/manual-verify
  manualVerifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { accountNumber, amount, bankReference } = req.body;

    if (!accountNumber || amount === undefined || amount === null) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Account number and amount are required',
        400
      );
    }

    const parsedAmount =
      typeof amount === 'number' ? amount : parseFloat(String(amount));

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return sendError(res, 'VALIDATION_ERROR', 'Amount must be a positive number', 400);
    }

    const result = await accountNumberService.verifyPaymentByAccountNumber(
      String(accountNumber).trim(),
      parsedAmount,
      bankReference ? String(bankReference).trim() : undefined
    );

    if (result.success) {
      return sendSuccess(
        res,
        result,
        result.message || 'Payment verified successfully'
      );
    }

    return sendError(res, 'VERIFICATION_FAILED', result.message || 'Failed to verify payment', 400);
  });

  // GET /api/admin/users
  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const plan = req.query.plan as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { accountNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (plan) where.subscriptionPlan = plan;
    if (status) where.subscriptionStatus = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          companyName: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          accountNumber: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              documents: true,
              subscriptions: true,
            },
          },
        } as any,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(
      res,
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Users retrieved successfully'
    );
  });

  // PUT /api/admin/users/:userId
  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { userId } = req.params;
    const { subscriptionPlan, subscriptionStatus, role } = req.body;

    const updateData: any = {};
    if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;
    if (role) updateData.role = role;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        role: true,
      } as any,
    });

    return sendSuccess(res, { user }, 'User updated successfully');
  });

  // GET /api/admin/analytics/documents
  getDocumentAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const [totalDocuments, byType, byStatus, recentDocuments, dailyStats] = await Promise.all([
      prisma.document.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.document.groupBy({
        by: ['type'],
        where: { createdAt: { gte: start, lte: end } },
        _count: true,
      }),
      prisma.document.groupBy({
        by: ['status'],
        where: { createdAt: { gte: start, lte: end } },
        _count: true,
      }),
      prisma.document.findMany({
        where: { createdAt: { gte: start, lte: end } },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.$queryRaw`
        SELECT 
          created_at::date as date,
          COUNT(*)::int as count
        FROM documents
        WHERE created_at >= ${start} AND created_at <= ${end}
        GROUP BY created_at::date
        ORDER BY date DESC
      ` as Promise<Array<{ date: Date; count: number }>>,
    ]);

    return sendSuccess(
      res,
      {
        totals: {
          totalDocuments,
          period: { start, end },
        },
        byType: byType.map((item) => ({
          type: item.type,
          count: item._count,
        })),
        byStatus: byStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
        recentDocuments,
        dailyStats,
      },
      'Document analytics retrieved successfully'
    );
  });

  // GET /api/admin/analytics/revenue
  getRevenueAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get payments using query helper
    const { query } = await import('../config/database');
    const paymentsResult = await query(
      `SELECT 
        plan,
        billing_cycle,
        SUM(amount_paid) as total_revenue,
        COUNT(*) as payment_count
      FROM payments
      WHERE status = 'completed' 
        AND created_at >= $1 
        AND created_at <= $2
      GROUP BY plan, billing_cycle`,
      [start, end]
    );
    const payments = paymentsResult.rows;

    // Get subscription stats
    const [activeSubscriptions, byPlan, byStatus] = await Promise.all([
      prisma.subscription.count({
        where: { status: 'active' },
      }),
      prisma.subscription.groupBy({
        by: ['plan'],
        _count: true,
      }),
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    const planPricing: Record<string, { monthly: number; annual: number }> = {
      starter: { monthly: 14900, annual: 149000 }, // in cents
      entry: { monthly: 29900, annual: 299000 },
      professional: { monthly: 69900, annual: 699000 },
      enterprise: { monthly: 149900, annual: 1499000 },
    };

    let mrr = 0;
    const monthlySubs = await prisma.subscription.findMany({
      where: { status: 'active' },
      select: { plan: true },
    });

    monthlySubs.forEach((sub) => {
      const pricing = planPricing[sub.plan as keyof typeof planPricing];
      if (pricing) {
        mrr += pricing.monthly; // Assume monthly for MRR calculation
      }
    });

    return sendSuccess(
      res,
      {
        revenue: {
          total: payments,
          mrr: mrr / 100, // Convert cents to currency
        },
        subscriptions: {
          active: activeSubscriptions,
          byPlan: byPlan.map((item) => ({
            plan: item.plan,
            count: item._count,
          })),
          byStatus: byStatus.map((item) => ({
            status: item.status,
            count: item._count,
          })),
        },
        period: { start, end },
      },
      'Revenue analytics retrieved successfully'
    );
  });

  // GET /api/admin/system/health
  getSystemHealth = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers24h,
      totalDocuments,
      documents24h,
      apiUsage24h,
      apiUsage7d,
      errorRate,
      databaseStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { updatedAt: { gte: last24h } },
      }),
      prisma.document.count(),
      prisma.document.count({
        where: { createdAt: { gte: last24h } },
      }),
      prisma.apiUsage.aggregate({
        where: { timestamp: { gte: last24h } },
        _sum: { tokensUsed: true, costUsd: true },
        _count: true,
      }),
      prisma.apiUsage.aggregate({
        where: { timestamp: { gte: last7d } },
        _sum: { tokensUsed: true, costUsd: true },
        _count: true,
      }),
      prisma.apiUsage.count({
        where: { timestamp: { gte: last24h }, success: false },
      }),
      prisma.$queryRaw`SELECT 1 as status`.then(() => ({ status: 'healthy' })).catch(() => ({ status: 'unhealthy' })) as Promise<{ status: string }>,
    ]);

    return sendSuccess(
      res,
      {
        users: {
          total: totalUsers,
          active24h: activeUsers24h,
        },
        documents: {
          total: totalDocuments,
          created24h: documents24h,
        },
        api: {
          usage24h: {
            requests: apiUsage24h._count,
            tokens: apiUsage24h._sum.tokensUsed || 0,
            cost: apiUsage24h._sum.costUsd || 0,
          },
          usage7d: {
            requests: apiUsage7d._count,
            tokens: apiUsage7d._sum.tokensUsed || 0,
            cost: apiUsage7d._sum.costUsd || 0,
          },
          successRate: apiUsage24h._count > 0
            ? ((apiUsage24h._count - errorRate) / apiUsage24h._count) * 100
            : 100,
        },
        database: databaseStatus,
        timestamp: now,
      },
      'System health retrieved successfully'
    );
  });
}

export const adminController = new AdminController();





