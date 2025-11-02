import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateToken, generateRefreshToken } from '../config/jwt';
import { User, UserPublic } from '../types/index';
import { AppError } from '../middleware/errorHandler';
import { sanitizeUser } from '../utils/helpers';
import { query } from '../config/database';
import crypto from 'crypto';

export class AuthService {
  // Signup new user
  async signup(
    email: string,
    password: string,
    fullName?: string,
    companyName?: string,
    subscriptionPlan?: string
  ): Promise<{ user: UserPublic; token: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 409);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, company_name, subscription_plan, subscription_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, full_name, company_name, subscription_plan, subscription_status, created_at, updated_at`,
      [email, password_hash, fullName || null, companyName || null, subscriptionPlan || 'starter', 'active']
    );
    
    const user = result.rows[0];
    
    // Generate account number for the new user
    const { accountNumberService } = await import('./accountNumberService');
    const firstName = fullName?.split(' ')[0] || 'User';
    await accountNumberService.generateAccountNumber(user.id, firstName);
    
    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    
    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);
    
    return {
      user: sanitizeUser(user),
      token,
      refreshToken,
    };
  }
  
  // Login user
  async login(
    email: string,
    password: string
  ): Promise<{ user: UserPublic; token: string; refreshToken: string }> {
    // Find user using Prisma
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        createdAt: true
      }
    });
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Check password - need to fetch full user for password
    const fullUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!fullUser) {
      throw new AppError('Invalid email or password', 401);
    }
    
    const isValidPassword = await bcrypt.compare(password, fullUser.passwordHash);
    
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    
    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);
    
    return {
      user: user as UserPublic,
      token,
      refreshToken,
    };
  }
  
  // Logout user (revoke refresh token)
  async logout(userId: string, refreshToken: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND token = $2',
      [userId, refreshToken]
    );
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
    const tokenResult = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false AND expires_at > NOW()',
      [refreshToken]
    );
    
    if (tokenResult.rows.length === 0) {
      throw new AppError('Refresh token is invalid or expired', 401);
    }
    
    // Get user
    const userResult = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }
    
    const user = userResult.rows[0];
    
    // Generate new tokens
    const newToken = generateToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    
    // Revoke old refresh token
    await query(
      'UPDATE refresh_tokens SET revoked = true WHERE token = $1',
      [refreshToken]
    );
    
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
        createdAt: true
      }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  }
  
  // Request password reset
  async requestPasswordReset(email: string): Promise<string> {
    // Find user
    const result = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      // Don't reveal if email exists or not
      return 'If the email exists, a reset link has been sent';
    }
    
    const userId = result.rows[0].id;
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Store reset token (expires in 1 hour)
    await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')
       ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = NOW() + INTERVAL '1 hour', created_at = NOW()`,
      [userId, hashedToken]
    );
    
    // TODO: Send email with reset link
    // await emailService.sendPasswordResetEmail(email, resetToken);
    
    return resetToken; // In production, don't return this - just send email
  }
  
  // Confirm password reset
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find valid token
    const result = await query(
      `SELECT user_id FROM password_reset_tokens 
       WHERE token = $1 AND expires_at > NOW() AND used = false`,
      [hashedToken]
    );
    
    if (result.rows.length === 0) {
      throw new AppError('Invalid or expired reset token', 400);
    }
    
    const userId = result.rows[0].user_id;
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [password_hash, userId]
    );
    
    // Mark token as used
    await query(
      'UPDATE password_reset_tokens SET used = true WHERE token = $1',
      [hashedToken]
    );
  }
  
  // Private: Store refresh token
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
  }
}

export const authService = new AuthService();


