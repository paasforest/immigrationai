import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

// Public routes (with rate limiting)
router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/reset-password', authLimiter, authController.requestPasswordReset);
router.post('/confirm-reset', authLimiter, authController.confirmPasswordReset);

// Protected routes
router.post('/logout', authenticateJWT, authController.logout);
router.get('/user', authenticateJWT, authController.getUser);

export default router;


