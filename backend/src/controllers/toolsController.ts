import { Request, Response } from 'express';
import { scoreHomeTies, type HomeTiesInput } from '../services/homeTiesScorer';
import {
  lookupCredentialEvaluation,
  SUPPORTED_EVALUATION_DESTINATIONS,
  PROFESSION_OPTIONS,
  type CredentialQuery,
} from '../services/credentialEvaluationService';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /api/tools/home-ties/score
 * Score an applicant's home ties strength
 */
export async function scoreHomeTiesHandler(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body as HomeTiesInput;

    // Basic validation
    const required = [
      'employmentStatus', 'employmentDuration', 'monthlyIncome',
      'propertyOwnership', 'familyInHomeCountry', 'financialCommitments',
      'bankAccountProfile', 'priorTravelHistory', 'visaType', 'destinationCountry',
    ];
    for (const field of required) {
      if (!input[field as keyof HomeTiesInput]) {
        throw new AppError(`Missing required field: ${field}`, 400);
      }
    }

    const result = scoreHomeTies(input);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to score home ties', 500);
  }
}

/**
 * POST /api/tools/credential-evaluation/lookup
 * Look up credential evaluation requirements
 */
export async function credentialLookupHandler(req: Request, res: Response): Promise<void> {
  try {
    const { originCountry, destinationCountry, professionType } = req.body as CredentialQuery;

    if (!originCountry || !destinationCountry || !professionType) {
      throw new AppError('originCountry, destinationCountry and professionType are required', 400);
    }

    const result = lookupCredentialEvaluation({ originCountry, destinationCountry, professionType });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Failed to lookup credential evaluation', 500);
  }
}

/**
 * GET /api/tools/credential-evaluation/options
 * Return dropdown options for the frontend
 */
export async function credentialOptionsHandler(_req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: {
      destinations: SUPPORTED_EVALUATION_DESTINATIONS,
      professions: PROFESSION_OPTIONS,
      originCountries: [
        'South Africa', 'Nigeria', 'Zimbabwe', 'Kenya', 'Ghana',
        'Ethiopia', 'Tanzania', 'Uganda', 'Zambia', 'Mozambique',
        'Namibia', 'Botswana', 'Cameroon', 'Senegal', 'Ivory Coast',
        'Angola', 'DR Congo', 'Rwanda', 'Malawi', 'Sudan', 'Egypt',
        'Morocco', 'Algeria', 'Tunisia', 'India', 'Philippines',
        'Pakistan', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Other',
      ],
    },
  });
}
