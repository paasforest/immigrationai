import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { documentService } from '../services/documentService';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import {
  generateSOPSchema,
  generateCoverLetterSchema,
  reviewSOPSchema,
} from '../utils/validators';

export class DocumentController {
  // POST /api/documents/generate-sop
  generateSOP = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    // Validate input
    const validation = generateSOPSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        validation.error.errors[0].message,
        400
      );
    }

    const result = await documentService.generateSOP(req.user.userId, validation.data);

    return sendSuccess(
      res,
      {
        id: result.id,
        content: result.content,
        tokensUsed: result.tokensUsed,
        type: 'sop',
      },
      'SOP generated successfully',
      201
    );
  });

  // POST /api/documents/generate-cover-letter
  generateCoverLetter = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    // Validate input
    const validation = generateCoverLetterSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        validation.error.errors[0].message,
        400
      );
    }

    const result = await documentService.generateCoverLetter(
      req.user.userId,
      validation.data
    );

    return sendSuccess(
      res,
      {
        id: result.id,
        content: result.content,
        tokensUsed: result.tokensUsed,
        type: 'cover_letter',
      },
      'Cover letter generated successfully',
      201
    );
  });

  // POST /api/documents/review-sop
  reviewSOP = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    // Validate input
    const validation = reviewSOPSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        validation.error.errors[0].message,
        400
      );
    }

    const result = await documentService.reviewSOP(req.user.userId, validation.data);

    return sendSuccess(res, result, 'SOP reviewed successfully');
  });

  // GET /api/documents
  getUserDocuments = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await documentService.getUserDocuments(req.user.userId, page, limit);

    return sendSuccess(res, result, 'Documents retrieved successfully');
  });

  // GET /api/documents/:id
  getDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = req.params;
    const document = await documentService.getDocument(req.user.userId, id);

    return sendSuccess(res, { document }, 'Document retrieved successfully');
  });

  // DELETE /api/documents/:id
  deleteDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const { id } = req.params;
    await documentService.deleteDocument(req.user.userId, id);

    return sendSuccess(res, null, 'Document deleted successfully');
  });
}

export const documentController = new DocumentController();


