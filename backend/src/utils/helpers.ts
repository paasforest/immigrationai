import { Response } from 'express';
import { ApiResponse, ApiErrorResponse } from '../types/response';

// Send success response
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

// Send error response
export const sendError = (
  res: Response,
  error: string,
  message: string,
  statusCode: number = 400
): Response => {
  const response: ApiErrorResponse = {
    success: false,
    error,
    message,
    statusCode,
  };
  return res.status(statusCode).json(response);
};

// Calculate pagination
export const getPagination = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  return { limit, offset, page };
};

// Format user object (remove sensitive fields)
export const sanitizeUser = (user: any) => {
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

// Calculate cost based on tokens (GPT-4 pricing)
export const calculateOpenAICost = (tokens: number, _model: string = 'gpt-4'): number => {
  // GPT-4 pricing: $0.03 per 1K input tokens, $0.06 per 1K output tokens
  // Simplified: average $0.045 per 1K tokens
  const costPer1kTokens = 0.045;
  return (tokens / 1000) * costPer1kTokens;
};

// Get subscription limits - Updated to match frontend plans
export const getSubscriptionLimits = (plan: string) => {
  const limits = {
    starter: {
      documentsPerMonth: 3,
      tokensPerMonth: 10000,
    },
    entry: {
      documentsPerMonth: 5,
      tokensPerMonth: 25000,
    },
    professional: {
      documentsPerMonth: -1, // unlimited
      tokensPerMonth: 500000,
    },
    enterprise: {
      documentsPerMonth: -1, // unlimited
      tokensPerMonth: -1, // unlimited
    },
    // Legacy plans for backward compatibility
    free: {
      documentsPerMonth: 3,
      tokensPerMonth: 10000,
    },
    pro: {
      documentsPerMonth: -1, // unlimited
      tokensPerMonth: 500000,
    },
  };
  
  return limits[plan as keyof typeof limits] || limits.starter;
};

// Check if user has exceeded limits
export const hasExceededLimits = async (
  _userId: string,
  plan: string,
  currentUsage: { documents: number; tokens: number }
): Promise<{ exceeded: boolean; reason?: string }> => {
  const limits = getSubscriptionLimits(plan);
  
  if (limits.documentsPerMonth !== -1 && currentUsage.documents >= limits.documentsPerMonth) {
    return { 
      exceeded: true, 
      reason: `Monthly document limit (${limits.documentsPerMonth}) exceeded` 
    };
  }
  
  if (limits.tokensPerMonth !== -1 && currentUsage.tokens >= limits.tokensPerMonth) {
    return { 
      exceeded: true, 
      reason: `Monthly token limit (${limits.tokensPerMonth}) exceeded` 
    };
  }
  
  return { exceeded: false };
};

