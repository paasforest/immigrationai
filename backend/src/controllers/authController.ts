import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { authService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { signupSchema, loginSchema } from '../utils/validators';

export class AuthController {
  // POST /api/auth/signup
  signup = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Validate request body
    const validation = signupSchema.safeParse(req.body);
    
    if (!validation.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        validation.error.errors[0].message,
        400
      );
    }
    
    const { email, password, fullName, companyName, subscriptionPlan, tracking } = req.body;
    
    // Create user with tracking data
    const result = await authService.signup(email, password, fullName, companyName, subscriptionPlan, tracking);
    
    return sendSuccess(
      res,
      result,
      'Account created successfully',
      201
    );
  });
  
  // POST /api/auth/login
  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        validation.error.errors[0].message,
        400
      );
    }
    
    const { email, password } = validation.data;
    
    // Login user
    const result = await authService.login(email, password);
    
    return sendSuccess(
      res,
      result,
      'Logged in successfully'
    );
  });
  
  // POST /api/auth/logout
  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }
    
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return sendError(res, 'VALIDATION_ERROR', 'Refresh token required', 400);
    }
    
    await authService.logout(req.user.userId, refreshToken);
    
    return sendSuccess(res, null, 'Logged out successfully');
  });
  
  // POST /api/auth/refresh
  refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return sendError(res, 'VALIDATION_ERROR', 'Refresh token required', 400);
    }
    
    const result = await authService.refreshToken(refreshToken);
    
    return sendSuccess(res, result, 'Token refreshed successfully');
  });
  
  // GET /api/auth/user
  getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }
    
    const user = await authService.getUserById(req.user.userId);
    
    return sendSuccess(res, { user }, 'User retrieved successfully');
  });
  
  // POST /api/auth/reset-password
  requestPasswordReset = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;
    
    if (!email) {
      return sendError(res, 'VALIDATION_ERROR', 'Email is required', 400);
    }
    
    await authService.requestPasswordReset(email);
    
    return sendSuccess(
      res,
      null,
      'If the email exists, a reset link has been sent'
    );
  });
  
  // POST /api/auth/confirm-reset
  confirmPasswordReset = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Token and new password are required',
        400
      );
    }
    
    if (newPassword.length < 8) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Password must be at least 8 characters',
        400
      );
    }
    
    await authService.confirmPasswordReset(token, newPassword);
    
    return sendSuccess(res, null, 'Password reset successfully');
  });
}

export const authController = new AuthController();


