import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateToken, generateRefreshToken } from '../config/jwt';
import { AppError } from '../middleware/errorHandler';
import { sanitizeUser } from '../utils/helpers';
import crypto from 'crypto';
// Define User type locally since Prisma client might not be generated yet
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  companyName: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  accountNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
}

export type UserPublic = Omit<User, 'passwordHash'> & {
  fullName: string | null;
  companyName: string | null;
};

export class AuthService {
  // Signup new user
  async signup(
    email: string,
    password: string,
    fullName?: string,
    companyName?: string
  ): Promise<{ user: UserPublic; token: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || null,
        companyName: companyName || null,
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
      },
    });

    // Generate account number after user creation
    const { accountNumberService } = await import('./accountNumberService');
    const accountNumber = await accountNumberService.generateAccountNumber(user.id, fullName?.split(' ')[0] || 'User');
    
    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    
    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    // Add missing property
    const userWithRequiredFields = {
      ...userWithoutPassword,
      isEmailVerified: false,
    };
    
    return {
      user: userWithRequiredFields,
      token,
      refreshToken,
    };
  }
  
  // Login user
  async login(
    email: string,
    password: string
  ): Promise<{ user: UserPublic; token: string; refreshToken: string }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    
    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    // Add missing property
    const userWithRequiredFields = {
      ...userWithoutPassword,
      isEmailVerified: false,
    };
    
    return {
      user: userWithRequiredFields,
      token,
      refreshToken,
    };
  }
  
  // Logout user (revoke refresh token)
  async logout(userId: string, refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
      },
      data: {
        revoked: true,
      },
    });
  }
  
  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    // Verify refresh token
    const { verifyRefreshToken } = await import('../config/jwt');
    let decoded;
    
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
    
    // Check if token is revoked
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    
    if (!tokenRecord) {
      throw new AppError('Refresh token is invalid or expired', 401);
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Generate new tokens
    const newToken = generateToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    
    // Revoke old refresh token
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
    
    // Store new refresh token
    await this.storeRefreshToken(user.id, newRefreshToken);
    
    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
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
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return {
      ...user,
      isEmailVerified: false,
    } as UserPublic;
  }
  
  // Request password reset
  async requestPasswordReset(email: string): Promise<string> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    
    if (!user) {
      // Don't reveal if email exists or not
      return 'If the email exists, a reset link has been sent';
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Store reset token (upsert to handle existing tokens)
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
    
    return resetToken; // In production, don't return this - just send email
  }
  
  // Confirm password reset
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: {
          gt: new Date(),
        },
        used: false,
      },
    });
    
    if (!resetToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Update password and mark token as used
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
  
  // Private: Store refresh token
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }
}

export const authService = new AuthService();


