import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@immigrationai.com';

export class EmailService {
  // Send verification email
  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: 'Verify Your Email - Immigration AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Immigration AI!</h2>
          <p>Please verify your email address to get started.</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      logger.info('Verification email sent', { email });
    } catch (error: any) {
      logger.error('Failed to send verification email', { error: error.message, email });
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: 'Reset Your Password - Immigration AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #E53E3E; margin-top: 24px;">
            This link will expire in 1 hour.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
          </p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      logger.info('Password reset email sent', { email });
    } catch (error: any) {
      logger.error('Failed to send password reset email', { error: error.message, email });
    }
  }

  // Send document ready notification
  async sendDocumentReadyEmail(email: string, documentType: string, documentId: string): Promise<void> {
    const documentUrl = `${process.env.FRONTEND_URL}/documents/${documentId}`;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: `Your ${documentType} is Ready - Immigration AI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Document is Ready!</h2>
          <p>Your ${documentType} has been successfully generated and is ready to view.</p>
          <a href="${documentUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            View Document
          </a>
          <p>You can access it anytime from your dashboard.</p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            Thank you for using Immigration AI!
          </p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      logger.info('Document ready email sent', { email, documentType });
    } catch (error: any) {
      logger.error('Failed to send document ready email', { error: error.message, email });
    }
  }

  // Send subscription confirmation
  async sendSubscriptionEmail(email: string, plan: string): Promise<void> {
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: `Subscription Confirmed - ${plan} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Subscription Confirmed!</h2>
          <p>Thank you for subscribing to the <strong>${plan}</strong> plan.</p>
          <p>You now have access to all premium features:</p>
          <ul>
            <li>Unlimited document generations</li>
            <li>Advanced AI suggestions</li>
            <li>Priority support</li>
            <li>Document history</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Go to Dashboard
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            You can manage your subscription anytime from your account settings.
          </p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      logger.info('Subscription email sent', { email, plan });
    } catch (error: any) {
      logger.error('Failed to send subscription email', { error: error.message, email });
    }
  }
}

export const emailService = new EmailService();


