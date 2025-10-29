import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Document generation rate limiter
export const documentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 document generations per hour
  message: 'Too many document generation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom rate limiter for per-user limits
export const createUserRateLimiter = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: `Rate limit exceeded. Maximum ${maxRequests} requests allowed.`,
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise fall back to IP
      const authReq = req as any;
      return authReq.user?.userId || req.ip || 'anonymous';
    },
  });
};

// Plan-based rate limiters
export const freePlanLimiter = createUserRateLimiter(3, 24 * 60 * 60 * 1000); // 3 per day
export const proPlanLimiter = createUserRateLimiter(100, 60 * 60 * 1000); // 100 per hour

