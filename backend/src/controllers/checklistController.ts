import { Response, Request } from 'express';
import { checklistService } from '../services/checklistService';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';

export class ChecklistController {
  // GET /api/checklists?country=X&visa_type=Y&refresh=true
  getChecklist = asyncHandler(async (req: Request, res: Response) => {
    const { country, visa_type, refresh } = req.query;

    if (!country || !visa_type) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'Country and visa_type are required',
        400
      );
    }

    const forceRefresh = refresh === 'true' || refresh === '1';
    const checklist = await checklistService.getChecklist(
      country as string,
      visa_type as string,
      forceRefresh
    );

    return sendSuccess(res, { checklist }, 'Checklist retrieved successfully');
  });

  // GET /api/checklists/all
  getAllChecklists = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await checklistService.getAllChecklists(page, limit);

    return sendSuccess(res, result, 'Checklists retrieved successfully');
  });
}

export const checklistController = new ChecklistController();


