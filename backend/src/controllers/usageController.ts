import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types/request';

export class UsageController {
  // Get current month usage for user
  async getCurrentUsage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get current month start date
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get usage count for current month
      const usageResult = await query(
        `SELECT COUNT(*) as count 
         FROM api_usage 
         WHERE user_id = $1 
         AND timestamp >= $2 
         AND feature = 'sop_generation'`,
        [userId, monthStart]
      );

      const currentUsage = parseInt(usageResult.rows[0].count);

      // Get user's subscription plan
      const userResult = await query(
        'SELECT subscription_plan FROM users WHERE id = $1',
        [userId]
      );

      const plan = userResult.rows[0].subscription_plan;
      
      // Calculate limits based on plan
      let monthlyLimit = 3; // Free plan default
      if (plan === 'pro' || plan === 'enterprise') {
        monthlyLimit = -1; // Unlimited
      }

      res.json({
        success: true,
        data: {
          currentMonth: currentUsage,
          monthlyLimit: monthlyLimit,
          plan: plan,
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get detailed usage history
  async getUsageHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { page = 1, limit = 20, feature } = req.query;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const offset = (Number(page) - 1) * Number(limit);
      
      let whereClause = 'WHERE user_id = $1';
      const params: any[] = [userId];
      
      if (feature) {
        whereClause += ' AND feature = $2';
        params.push(feature);
      }

      // Get usage history
      const usageResult = await query(
        `SELECT feature, tokens_used, cost_usd, success, timestamp
         FROM api_usage 
         ${whereClause}
         ORDER BY timestamp DESC 
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, Number(limit), offset]
      );

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM api_usage ${whereClause}`,
        params
      );

      const total = parseInt(countResult.rows[0].total);

      res.json({
        success: true,
        data: {
          usage: usageResult.rows,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get usage statistics
  async getUsageStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get current month stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const statsResult = await query(
        `SELECT 
           COUNT(*) as total_requests,
           COUNT(CASE WHEN success = true THEN 1 END) as successful_requests,
           SUM(COALESCE(tokens_used, 0)) as total_tokens,
           SUM(COALESCE(cost_usd, 0)) as total_cost,
           feature
         FROM api_usage 
         WHERE user_id = $1 AND timestamp >= $2
         GROUP BY feature
         ORDER BY total_requests DESC`,
        [userId, monthStart]
      );

      // Get last 6 months trend
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const trendResult = await query(
        `SELECT 
           DATE_TRUNC('month', timestamp) as month,
           COUNT(*) as requests
         FROM api_usage 
         WHERE user_id = $1 AND timestamp >= $2
         GROUP BY DATE_TRUNC('month', timestamp)
         ORDER BY month`,
        [userId, sixMonthsAgo]
      );

      res.json({
        success: true,
        data: {
          currentMonth: statsResult.rows,
          trend: trendResult.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usageController = new UsageController();

