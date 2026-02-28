import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateToken, generateRefreshToken } from '../config/jwt';
import { User, UserPublic } from '../types/index';
import { AppError } from '../middleware/errorHandler';
import { sanitizeUser } from '../utils/helpers';
import crypto from 'crypto';

export class AuthService {
  // Signup new user
  async signup(
    email: string,
    password: string,
    fullName?: string,
    companyName?: string,
    subscriptionPlan?: string,
    tracking?: any
  ): Promise<{ user: UserPublic; token: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Marketing Test Mode: set MARKETING_TEST_MODE=true in .env to grant all new signups instant access
    const marketingTestMode = process.env.MARKETING_TEST_MODE === 'true';
    const finalPlan = marketingTestMode ? 'marketing_test' : (subscriptionPlan || 'starter');
    const finalStatus = marketingTestMode ? 'active' : 'pending';

    // Create user via Prisma (respects full schema — all columns populated correctly)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || null,
        companyName: companyName || null,
        subscriptionPlan: finalPlan,
        subscriptionStatus: finalStatus,
      },
    });

    // Generate account number for EFT reference
    try {
      const { accountNumberService } = await import('./accountNumberService');
      const firstName = fullName?.split(' ')[0] || 'User';
      await accountNumberService.generateAccountNumber(user.id, firstName);
    } catch (error) {
      // Non-fatal — account number can be generated later on first payment
      console.error('Failed to generate account number during signup:', error);
    }

    // Save UTM / tracking data if present
    if (tracking && typeof tracking === 'object' && Object.keys(tracking).length > 0) {
      try {
        const { trackingService } = await import('./trackingService');
        await trackingService.saveUserTracking(user.id, {
          utmSource: tracking.utm_source || tracking.utmSource,
          utmMedium: tracking.utm_medium || tracking.utmMedium,
          utmCampaign: tracking.utm_campaign || tracking.utmCampaign,
          utmContent: tracking.utm_content || tracking.utmContent,
          utmTerm: tracking.utm_term || tracking.utmTerm,
          referrer: tracking.referrer,
          landingPage: tracking.landingPage,
          sessionId: tracking.sessionId,
        });
      } catch (error) {
        console.error('Failed to save tracking data (non-fatal):', error);
      }
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Store refresh token via Prisma
    await this.storeRefreshToken(user.id, refreshToken);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        isEmailVerified: false,
        role: (user as any).role || 'user',
      } as unknown as UserPublic,
      token,
      refreshToken,
    };
  }

  // Login user
  async login(
    email: string,
    password: string
  ): Promise<{ user: UserPublic; token: string; refreshToken: string }> {
    // Single query — fetch full user including passwordHash
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await this.storeRefreshToken(user.id, refreshToken);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: {
        ...userWithoutPassword,
        isEmailVerified: false,
        role: (user as any).role || 'user',
      } as unknown as UserPublic,
      token,
      refreshToken,
    };
  }

  // Logout user (revoke refresh token)
  async logout(userId: string, refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, token: refreshToken },
      data: { revoked: true },
    });
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const { verifyRefreshToken } = await import('../config/jwt');
    let decoded: any;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    // Check token is valid and not revoked
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      throw new AppError('Refresh token is invalid or expired', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const newToken = generateToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Rotate: revoke old, store new
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });

    await this.storeRefreshToken(user.id, newRefreshToken);

    return { token: newToken, refreshToken: newRefreshToken };
  }

  // Get user by ID
  async getUserById(userId: string): Promise<UserPublic> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      } as any,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      ...user,
      isEmailVerified: false,
    } as unknown as UserPublic;
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return 'If the email exists, a reset link has been sent';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        used: false,
      },
      create: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // TODO: Send email with reset link
    // await emailService.sendPasswordResetEmail(email, resetToken);

    return resetToken;
  }

  // Confirm password reset
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: { gt: new Date() },
        used: false,
      },
    });

    if (!resetToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);
  }

  // Store refresh token via Prisma
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }
}

export const authService = new AuthService();
