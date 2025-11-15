import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendError, sendSuccess } from '../utils/helpers';
import { eligibilityService } from '../services/eligibilityService';
import { AuthRequest } from '../types/request';

class EligibilityController {
  // Public endpoint: POST /api/eligibility/check
  checkEligibility = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body || {};

    if (!payload.country || !payload.visaType) {
      return sendError(res, 'VALIDATION_ERROR', 'Country and visa type are required', 400);
    }

    const result = await eligibilityService.assessEligibility({
      userId: payload.userId,
      email: payload.email,
      country: payload.country,
      visaType: payload.visaType,
      ageRange: payload.ageRange,
      relationshipStatus: payload.relationshipStatus,
      educationLevel: payload.educationLevel,
      workExperienceYears: payload.workExperienceYears,
      englishExam: payload.englishExam,
      proofOfFunds: payload.proofOfFunds,
      homeTies: payload.homeTies,
      previousRefusals: payload.previousRefusals,
      travelHistory: payload.travelHistory,
      sponsorIncome: payload.sponsorIncome,
      notes: payload.notes,
      tracking: payload.tracking,
      ipAddress: req.ip,
    });

    return sendSuccess(res, result, 'Eligibility assessment completed');
  });

  // Admin endpoint: GET /api/admin/analytics/eligibility
  getAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const analytics = await eligibilityService.getEligibilityAnalytics();
    return sendSuccess(res, analytics, 'Eligibility analytics retrieved');
  });
}

export const eligibilityController = new EligibilityController();

