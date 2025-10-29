import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/request';
import { verifyToken } from '../config/jwt';
import { sendError } from '../utils/helpers';
import { AppError } from './errorHandler';

// Authenticate JWT middleware
export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void | Response => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'UNAUTHORIZED', 'No token provided', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 'TOKEN_EXPIRED', 'Token has expired', 401);
      }
      return sendError(res, 'INVALID_TOKEN', 'Invalid token', 401);
    }
  } catch (error) {
    return sendError(res, 'AUTH_ERROR', 'Authentication failed', 401);
  }
};

// Require auth middleware (alias)
export const requireAuth = authenticateJWT;

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Token invalid but we don't fail - just continue without user
    }
  }
  
  next();
};

// Check subscription plan middleware
export const requirePlan = (...allowedPlans: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
      }
      
      // Get user's current plan from database
      const { query } = await import('../config/database');
      const result = await query(
        'SELECT subscription_plan FROM users WHERE id = $1',
        [req.user.userId]
      );
      
      if (result.rows.length === 0) {
        return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
      }
      
      const userPlan = result.rows[0].subscription_plan;
      
      if (!allowedPlans.includes(userPlan)) {
        return sendError(
          res,
          'PLAN_REQUIRED',
          `This feature requires ${allowedPlans.join(' or ')} plan`,
          403
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};


