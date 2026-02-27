import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import prisma from '../config/prisma';
import { Resend } from 'resend';

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'uploads/payment-proofs';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
  },
});

export const uploadMiddleware = upload.single('proof');

// ─── Helper: notify admin ─────────────────────────────────────────────────────
async function notifyAdmin(proof: {
  accountNumber: string;
  fileName: string;
  userName: string;
  userEmail: string;
  plan: string;
  amount: number;
}) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: `ImmigrationAI Payments <${process.env.FROM_EMAIL || 'noreply@immigrationai.co.za'}>`,
      to: [process.env.ADMIN_EMAIL || 'payments@immigrationai.co.za'],
      subject: `💳 New EFT Proof Uploaded — ${proof.accountNumber}`,
      html: `
        <h2 style="color:#1e293b">New Payment Proof Received</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:6px;font-weight:600">Customer</td><td style="padding:6px">${proof.userName} (${proof.userEmail})</td></tr>
          <tr style="background:#f8fafc"><td style="padding:6px;font-weight:600">Account / Reference</td><td style="padding:6px;font-family:monospace;font-size:16px;color:#0f2557">${proof.accountNumber}</td></tr>
          <tr><td style="padding:6px;font-weight:600">Plan</td><td style="padding:6px">${proof.plan}</td></tr>
          <tr style="background:#f8fafc"><td style="padding:6px;font-weight:600">Amount</td><td style="padding:6px">R${(proof.amount / 100).toFixed(2)}</td></tr>
          <tr><td style="padding:6px;font-weight:600">File</td><td style="padding:6px">${proof.fileName}</td></tr>
        </table>
        <p style="margin-top:16px">
          <a href="${process.env.FRONTEND_URL || 'https://app.immigrationai.co.za'}/admin/payments" 
             style="background:#0f2557;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
            Review in Admin Panel →
          </a>
        </p>
      `,
    });
  } catch (err: any) {
    logger.warn('paymentProof: failed to send admin email', { error: err.message });
  }
}

// ─── Controller class ─────────────────────────────────────────────────────────
export class PaymentProofController {
  /**
   * POST /api/payments/upload-proof
   * Authenticated user uploads EFT proof of payment.
   */
  uploadProof = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    if (!req.file) return sendError(res, 'VALIDATION_ERROR', 'No file uploaded', 400);

    const userId = req.user.userId;

    // Verify user and get their account number
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, accountNumber: true, fullName: true, email: true },
    });

    if (!userRecord) return sendError(res, 'NOT_FOUND', 'User not found', 404);
    if (!userRecord.accountNumber) return sendError(res, 'VALIDATION_ERROR', 'No account number found — please initiate payment first', 400);

    const accountNumber = userRecord.accountNumber;

    // Get the pending payment for amount/plan info
    const pending = await prisma.pendingPayment.findUnique({ where: { accountNumber } });

    try {
      const proof = await prisma.paymentProof.create({
        data: {
          userId,
          accountNumber,
          filePath: req.file.path,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          status: 'pending',
        },
      });

      // Notify admin
      await notifyAdmin({
        accountNumber,
        fileName: req.file.originalname,
        userName: userRecord.fullName || 'Unknown',
        userEmail: userRecord.email,
        plan: pending?.plan || 'unknown',
        amount: pending?.amount || 0,
      });

      return sendSuccess(res, {
        proofId: proof.id,
        status: 'pending',
        accountNumber,
      }, 'Proof of payment uploaded. Your account will be activated within 1–2 business days.');
    } catch (error) {
      // Clean up file if DB write fails
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      throw error;
    }
  });

  /**
   * GET /api/payments/proof-status
   * Returns the latest proof status for the authenticated user.
   */
  getProofStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);

    const proof = await prisma.paymentProof.findFirst({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      select: { status: true, createdAt: true, adminNotes: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { subscriptionStatus: true, accountNumber: true },
    });

    return sendSuccess(res, {
      proofStatus: proof?.status || 'none',
      uploadedAt: proof?.createdAt || null,
      adminNotes: proof?.adminNotes || null,
      accountStatus: user?.subscriptionStatus || 'inactive',
      accountNumber: user?.accountNumber || null,
    }, 'Payment proof status retrieved');
  });
}

export const paymentProofController = new PaymentProofController();
