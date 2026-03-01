import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { getCaseById } from '../helpers/prismaScopes';
import { createSOP } from './aiController';

// Note: This controller is for Case Documents (file uploads)
// Separate from AI-generated Document model

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const organizationId = (req as any).organizationId;
    const caseId = req.body.caseId;
    
    if (!organizationId || !caseId) {
      return cb(new Error('Organization ID and Case ID are required'), '');
    }

    const uploadPath = path.join('uploads', organizationId, caseId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedFilename}`);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, DOCX are allowed'));
  }
};

// Multer configuration
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});

/**
 * Upload document for a case
 */
export async function uploadDocument(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { caseId, name, category, notes, expiryDate, checklistItemId } = req.body;

    if (!req.file) {
      throw new AppError('File is required', 400);
    }

    if (!caseId) {
      throw new AppError('Case ID is required', 400);
    }

    // Validate case belongs to organization
    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) {
      // Clean up uploaded file if case doesn't exist
      fs.unlinkSync(req.file.path);
      throw new AppError('Case not found or access denied', 404);
    }

    // Determine who is uploading (client or professional)
    const uploaderRole = (req as any).organizationRole === 'applicant' ? 'client' : 'professional';

    // Create document record
    const document = await prisma.caseDocument.create({
      data: {
        caseId,
        organizationId,
        uploadedById: user.userId,
        uploadedByRole: uploaderRole,
        name: name || req.file.originalname,
        category: category || (uploaderRole === 'client' ? 'client' : 'supporting'),
        fileUrl: req.file.path,
        fileSize: BigInt(req.file.size),
        fileType: req.file.mimetype,
        status: uploaderRole === 'client' ? 'pending_review' : 'verified',
        notes,
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
      },
      include: {
        uploadedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // If checklistItemId provided, link document and mark item as completed
    if (checklistItemId) {
      await prisma.checklistItem.update({
        where: { id: checklistItemId },
        data: {
          documentId: document.id,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.userId,
        action: 'document_uploaded',
        resourceType: 'case_document',
        resourceId: document.id,
        metadata: {
          caseId,
          fileName: document.name,
          category: document.category,
        },
      },
    });

    // Create notification for assigned professional if document uploaded by applicant
    if (caseData.assignedProfessionalId && organizationRole === 'applicant') {
      try {
        const { createNotification } = await import('./notificationController');
        await createNotification({
          organizationId,
          userId: caseData.assignedProfessionalId,
          type: 'document_uploaded',
          title: `New document uploaded: ${document.name}`,
          body: `Document uploaded for case ${caseData.referenceNumber}`,
          resourceType: 'document',
          resourceId: document.id,
        });
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully',
    });
  } catch (error: any) {
    // Clean up file if error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to upload document', 500);
  }
}

export const generateSOP = createSOP;

export const documentController = {
  uploadDocument,
  getDocumentsByCase,
  updateDocument,
  deleteDocument,
  getDocumentDownload,
  uploadMiddleware,
  generateSOP,
};

/**
 * Get all documents for a case
 * Grouped by category
 */
export async function getDocumentsByCase(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { caseId } = req.params;

    // Validate case belongs to organization
    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) {
      throw new AppError('Case not found or access denied', 404);
    }

    // Applicant can only see documents for their own case
    if (organizationRole === 'applicant' && caseData.applicantId !== user.userId) {
      throw new AppError('Access denied: You can only view documents for your own case', 403);
    }

    // Get documents
    const documents = await prisma.caseDocument.findMany({
      where: {
        caseId,
        organizationId,
      },
      include: {
        uploadedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by category
    const groupedByCategory = documents.reduce((acc: any, doc: any) => {
      const category = doc.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        documents,
        groupedByCategory,
      },
      message: 'Documents retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve documents', 500);
  }
}

/**
 * Update document
 * Only org_admin and professional can update status
 */
export async function updateDocument(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;
    const { name, category, notes, expiryDate, status } = req.body;

    // Get document
    const document = await prisma.caseDocument.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!document) {
      throw new AppError('Document not found or access denied', 404);
    }

    // Only org_admin and professional can update status
    if (status && organizationRole !== 'org_admin' && organizationRole !== 'professional') {
      throw new AppError('Only organization administrators and professionals can update document status', 403);
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (notes !== undefined) updateData.notes = notes;
    if (expiryDate !== undefined) {
      updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }
    if (status !== undefined) updateData.status = status;

    const updatedDocument = await prisma.caseDocument.update({
      where: { id },
      data: updateData,
      include: {
        uploadedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.userId,
        action: 'document_updated',
        resourceType: 'case_document',
        resourceId: id,
        metadata: { status, name, category },
      },
    });

    res.json({
      success: true,
      data: updatedDocument,
      message: 'Document updated successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to update document', 500);
  }
}

/**
 * Delete document
 * Only org_admin and professional can delete
 */
export async function deleteDocument(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;

    // Only org_admin and professional can delete
    if (organizationRole !== 'org_admin' && organizationRole !== 'professional') {
      throw new AppError('Only organization administrators and professionals can delete documents', 403);
    }

    // Get document
    const document = await prisma.caseDocument.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!document) {
      throw new AppError('Document not found or access denied', 404);
    }

    // Delete file from storage
    if (fs.existsSync(document.fileUrl)) {
      fs.unlinkSync(document.fileUrl);
    }

    // Delete database record
    await prisma.caseDocument.delete({
      where: { id },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.userId,
        action: 'document_deleted',
        resourceType: 'case_document',
        resourceId: id,
        metadata: { fileName: document.name },
      },
    });

    res.json({
      success: true,
      data: { id },
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to delete document', 500);
  }
}

/**
 * Download document
 * Streams file back to client
 */
export async function getDocumentDownload(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;

    // Get document
    const document = await prisma.caseDocument.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        case: {
          select: { id: true, applicantId: true },
        },
      },
    });

    if (!document) {
      throw new AppError('Document not found or access denied', 404);
    }

    // Applicant can only download documents for their own case
    if (organizationRole === 'applicant' && document.case.applicantId !== user.userId) {
      throw new AppError('Access denied: You can only download documents for your own case', 403);
    }

    // Check if file exists
    if (!fs.existsSync(document.fileUrl)) {
      throw new AppError('File not found on server', 404);
    }

    // Set headers
    const fileExtension = path.extname(document.fileUrl).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    res.setHeader('Content-Type', contentTypeMap[fileExtension] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);

    // Stream file
    const fileStream = fs.createReadStream(document.fileUrl);
    fileStream.pipe(res);
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to download document', 500);
  }
}

/**
 * Toggle embassy package flag on a document
 * Only professionals/org_admin can do this
 */
export async function toggleEmbassyPackage(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;

    if (organizationRole !== 'org_admin' && organizationRole !== 'professional' && organizationRole !== 'staff') {
      throw new AppError('Only professionals can manage the embassy package', 403);
    }

    const document = await prisma.caseDocument.findFirst({ where: { id, organizationId } });
    if (!document) throw new AppError('Document not found', 404);

    const updated = await (prisma.caseDocument as any).update({
      where: { id },
      data: { isEmbassyPackage: !document.isEmbassyPackage },
    });

    res.json({ success: true, data: updated, message: updated.isEmbassyPackage ? 'Added to embassy package' : 'Removed from embassy package' });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to update embassy package', 500);
  }
}

/**
 * Verify a client-uploaded document (mark as verified)
 */
export async function verifyDocument(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;

    if (organizationRole !== 'org_admin' && organizationRole !== 'professional' && organizationRole !== 'staff') {
      throw new AppError('Only professionals can verify documents', 403);
    }

    const document = await prisma.caseDocument.findFirst({ where: { id, organizationId } });
    if (!document) throw new AppError('Document not found', 404);

    const updated = await prisma.caseDocument.update({
      where: { id },
      data: { status: 'verified' },
    });

    res.json({ success: true, data: updated, message: 'Document verified' });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to verify document', 500);
  }
}

/**
 * Send embassy package to client — notifies client that documents are ready
 */
export async function sendEmbassyPackage(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { caseId } = req.params;

    if (organizationRole !== 'org_admin' && organizationRole !== 'professional' && organizationRole !== 'staff') {
      throw new AppError('Only professionals can send the embassy package', 403);
    }

    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) throw new AppError('Case not found', 404);

    // Get embassy package documents
    const embassyDocs = await (prisma.caseDocument as any).findMany({
      where: { caseId, organizationId, isEmbassyPackage: true },
      select: { id: true, name: true, fileType: true },
    });

    if (embassyDocs.length === 0) {
      throw new AppError('No documents marked for embassy package. Please mark documents first.', 400);
    }

    // Update case status to submitted
    await prisma.case.update({
      where: { id: caseId },
      data: { status: 'submitted', submittedAt: new Date() },
    });

    // Notify the applicant
    if (caseData.applicantId) {
      try {
        const { createNotification } = await import('./notificationController');
        await createNotification({
          organizationId,
          userId: caseData.applicantId,
          type: 'embassy_package_ready',
          title: '📦 Your embassy documents are ready!',
          body: `${embassyDocs.length} document(s) prepared for ${caseData.title}. Log in to your portal to download.`,
          resourceType: 'case',
          resourceId: caseId,
        });

        // Send email
        const applicant = await prisma.user.findUnique({ where: { id: caseData.applicantId }, select: { email: true, fullName: true } });
        const professional = await prisma.user.findUnique({ where: { id: user.userId }, select: { fullName: true } });

        if (applicant?.email) {
          const { sendCaseUpdateEmail } = await import('../services/emailService');
          await sendCaseUpdateEmail({
            toEmail: applicant.email,
            applicantName: applicant.fullName || 'Applicant',
            caseReference: caseData.referenceNumber,
            updateType: 'embassy_package_ready',
            message: `Your specialist ${professional?.fullName || 'your specialist'} has prepared your embassy document package (${embassyDocs.length} files). Please log in to your portal to download and take to the embassy.`,
            portalUrl: `${process.env.FRONTEND_URL}/portal/cases/${caseId}`,
          });
        }
      } catch (notifyErr) {
        console.error('Failed to notify applicant:', notifyErr);
      }
    }

    res.json({
      success: true,
      data: { documentsCount: embassyDocs.length, caseStatus: 'submitted' },
      message: `Embassy package sent to client. ${embassyDocs.length} document(s) ready for download.`,
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to send embassy package', 500);
  }
}

/**
 * Get embassy package documents for a case
 * Accessible by both professional and client
 */
export async function getEmbassyPackage(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { caseId } = req.params;

    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) throw new AppError('Case not found', 404);

    // Applicant can only view their own case
    if (organizationRole === 'applicant' && caseData.applicantId !== user.userId) {
      throw new AppError('Access denied', 403);
    }

    const docs = await (prisma.caseDocument as any).findMany({
      where: { caseId, organizationId, isEmbassyPackage: true },
      include: { uploadedBy: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: { documents: docs, count: docs.length } });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to get embassy package', 500);
  }
}

/**
 * Download all embassy package documents as ZIP
 */
export async function downloadEmbassyPackageZip(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { caseId } = req.params;

    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) throw new AppError('Case not found', 404);

    if (organizationRole === 'applicant' && caseData.applicantId !== user.userId) {
      throw new AppError('Access denied', 403);
    }

    const docs = await (prisma.caseDocument as any).findMany({
      where: { caseId, organizationId, isEmbassyPackage: true },
    });

    if (docs.length === 0) throw new AppError('No documents in embassy package', 404);

    // Create a simple tar-like ZIP using archiver
    try {
      const archiver = await import('archiver');
      const archive = archiver.default('zip', { zlib: { level: 9 } });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="embassy-package-${caseData.referenceNumber}.zip"`);

      archive.pipe(res);

      for (const doc of docs) {
        if (fs.existsSync(doc.fileUrl)) {
          const ext = path.extname(doc.fileUrl);
          const safeName = doc.name.replace(/[^a-zA-Z0-9.-]/g, '_') + ext;
          archive.file(doc.fileUrl, { name: safeName });
        }
      }

      await archive.finalize();
    } catch (archiveErr: any) {
      // Fallback: if archiver not available, return list of download links
      res.json({
        success: false,
        message: 'ZIP download not available. Please download files individually.',
        data: { documents: docs.map((d: any) => ({ id: d.id, name: d.name })) },
      });
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to create zip', 500);
  }
}

/**
 * Get all documents for organization (not scoped to a case)
 */
export async function getAllDocumentsByOrg(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId!;
    const { category, status, expiringWithin, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {
      organizationId,
    };

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (expiringWithin) {
      const days = Number(expiringWithin);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      where.expiryDate = {
        lte: futureDate,
        gte: new Date(),
      };
    }

    // Get documents with case info
    const [documents, total] = await Promise.all([
      prisma.caseDocument.findMany({
        where,
        include: {
          case: {
            select: {
              id: true,
              referenceNumber: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.caseDocument.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      message: 'Documents retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to get documents', 500);
  }
}
