import { Request, Response } from 'express';
import { AuthRequest } from '../types/request';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/payment-proofs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

export const uploadMiddleware = upload.single('proof');

export class PaymentProofController {
  // POST /api/payments/upload-proof
  uploadProof = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    if (!req.file) {
      return sendError(res, 'VALIDATION_ERROR', 'No file uploaded', 400);
    }

    const { userId, accountNumber } = req.body;

    // Validate required fields
    if (!userId || !accountNumber) {
      return sendError(res, 'VALIDATION_ERROR', 'User ID and account number are required', 400);
    }

    // Verify the user owns this account number
    const { query } = await import('../config/database');
    const userResult = await query(
      'SELECT id, account_number FROM users WHERE id = $1 AND account_number = $2',
      [userId, accountNumber]
    );

    if (userResult.rows.length === 0) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid account number for user', 400);
    }

    try {
      // Create payment proof record
      const proofId = randomUUID();
      await query(
        `INSERT INTO payment_proofs (id, user_id, account_number, file_path, file_name, file_size, file_type, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          proofId,
          userId,
          accountNumber,
          req.file.path,
          req.file.originalname,
          req.file.size,
          req.file.mimetype,
          'pending'
        ]
      );

      // Update payment status to 'verifying' (not activated yet)
      await query(
        `UPDATE payments 
         SET status = 'verifying', 
             updated_at = NOW()
         WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      // Send notification to admin (TODO: implement email notification)

      return sendSuccess(res, {
        proofId,
        status: 'pending',
        message: 'Payment proof uploaded successfully. Your account will be activated within 24 hours after verification.'
      }, 'Payment proof uploaded. Awaiting admin verification.');

    } catch (error) {
      // Clean up uploaded file if database operation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw error;
    }
  });

  // Activate user account immediately
  private activateUserAccount = async (userId: string, proofId: string) => {
    const { query } = await import('../config/database');
    
    // Update user subscription status
    await query(
      `UPDATE users 
       SET subscription_status = 'active', 
           updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );

    // Update payment proof status
    await query(
      'UPDATE payment_proofs SET status = $1, updated_at = NOW() WHERE id = $2',
      ['verified', proofId]
    );

    // Create subscription record
    const currentDate = new Date();
    const nextBillingDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await query(
      `INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         plan = $2,
         status = $3,
         current_period_start = $4,
         current_period_end = $5,
         updated_at = NOW()`,
      [userId, 'entry', 'active', currentDate, nextBillingDate]
    );
  };

  // GET /api/payments/proof-status
  getProofStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { query } = await import('../config/database');
    const result = await query(
      `SELECT pp.status, pp.created_at, u.subscription_status
       FROM payment_proofs pp
       JOIN users u ON pp.user_id = u.id
       WHERE pp.user_id = $1
       ORDER BY pp.created_at DESC
       LIMIT 1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return sendSuccess(res, { status: 'none' }, 'No payment proof found');
    }

    return sendSuccess(res, {
      status: result.rows[0].status,
      uploadedAt: result.rows[0].created_at,
      accountStatus: result.rows[0].subscription_status
    }, 'Payment proof status retrieved');
  });
}

export const paymentProofController = new PaymentProofController();
