import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/request';
import { sendError } from '../utils/helpers';
import { query } from '../config/database';

// Middleware to require admin role
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    // Get user's role from database
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
    }

    const userRole = result.rows[0].role || 'user';

    if (userRole !== 'admin') {
      return sendError(
        res,
        'FORBIDDEN',
        'Admin access required. Only administrators can access this resource.',
        403
      );
    }

    next();
  } catch (error) {
    return sendError(res, 'AUTH_ERROR', 'Failed to verify admin access', 500);
  }
};

