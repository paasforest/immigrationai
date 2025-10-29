import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth';
import { AuthRequest } from '../types/request';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get analytics data
router.get('/analytics', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { timeRange = '30d' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate date range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overview statistics
    const totalUsers = await prisma.user.count();
    const totalDocuments = await prisma.document.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Get user's documents
    const userDocuments = await prisma.document.findMany({
      where: {
        userId: userId,
        createdAt: { gte: startDate }
      }
    });

    // Calculate success rate (documents that were generated successfully)
    const successfulDocuments = userDocuments.filter(doc => doc.status === 'completed').length;
    const successRate = userDocuments.length > 0 
      ? (successfulDocuments / userDocuments.length) * 100 
      : 0;

    // Get document types breakdown
    const documentsByType = await prisma.document.groupBy({
      by: ['type'],
      where: {
        userId: userId,
        createdAt: { gte: startDate }
      },
      _count: true
    });

    // Get active subscriptions
    const activeSubscriptions = await prisma.user.count({
      where: {
        subscriptionPlan: { not: 'starter' },
        subscriptionStatus: 'active'
      }
    });

    // Calculate monthly revenue (placeholder - adjust based on your payment system)
    const monthlyRevenue = activeSubscriptions * 49.99; // Example calculation

    // Return analytics data
    res.json({
      overview: {
        totalUsers,
        totalDocuments: userDocuments.length,
        successRate: Math.round(successRate * 10) / 10,
        avgProcessingTime: 2.3, // Placeholder - implement actual calculation
        monthlyRevenue: Math.round(monthlyRevenue),
        activeSubscriptions
      },
      usageStats: {
        documentsByType: documentsByType.map(item => ({
          type: item.type || 'Unknown',
          count: item._count,
          percentage: userDocuments.length > 0 
            ? Math.round((item._count / userDocuments.length) * 100 * 10) / 10 
            : 0
        })),
        countriesByUsage: [], // Placeholder - implement if you track countries
        peakHours: [], // Placeholder - implement if you track hours
        monthlyTrend: [] // Placeholder - implement monthly trend calculation
      },
      userInsights: {
        newUsers: 0, // Placeholder
        returningUsers: 0, // Placeholder
        churnRate: 0, // Placeholder
        avgSessionDuration: 0, // Placeholder
        topFeatures: [] // Placeholder
      },
      performance: {
        systemUptime: 99.8, // Placeholder
        avgResponseTime: 1.2, // Placeholder
        errorRate: 0.3, // Placeholder
        apiCalls: 0 // Placeholder
      }
    });
  } catch (error: any) {
    logger.error('Analytics fetch error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;

