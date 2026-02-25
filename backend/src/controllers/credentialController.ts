import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { evaluationBodies, africanUniversities, attestationRequirements } from '../data/credentialData';
import { OpenAIService } from '../services/openaiService';

const openaiService = new OpenAIService();

/**
 * Get evaluation bodies for a destination country
 */
export async function getEvaluationBodies(req: Request, res: Response): Promise<void> {
  try {
    const { destinationCountry } = req.query;

    if (!destinationCountry) {
      throw new AppError('Destination country is required', 400);
    }

    const country = destinationCountry as string;
    const bodies = evaluationBodies[country as keyof typeof evaluationBodies];

    if (!bodies) {
      res.json({
        success: true,
        data: [],
        message: `No evaluation bodies found for ${country}`,
      });
      return;
    }

    res.json({
      success: true,
      data: bodies,
      message: 'Evaluation bodies retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to get evaluation bodies', { error: error.message });
    throw new AppError(error.message || 'Failed to get evaluation bodies', 500);
  }
}

/**
 * Check university recognition status
 */
export async function checkUniversityRecognition(req: Request, res: Response): Promise<void> {
  try {
    const { university, country } = req.query;

    if (!university) {
      throw new AppError('University name is required', 400);
    }

    const searchTerm = (university as string).toLowerCase();
    const countryFilter = country ? (country as string).toLowerCase() : null;

    const matches = africanUniversities.filter((uni) => {
      const matchesName = uni.university.toLowerCase().includes(searchTerm);
      const matchesCountry = countryFilter
        ? uni.country.toLowerCase() === countryFilter
        : true;
      return matchesName && matchesCountry;
    });

    res.json({
      success: true,
      data: matches,
      message: matches.length > 0 ? 'Universities found' : 'No universities found',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to check university recognition', { error: error.message });
    throw new AppError(error.message || 'Failed to check university recognition', 500);
  }
}

/**
 * Get attestation steps for origin country
 */
export async function getAttestationSteps(req: Request, res: Response): Promise<void> {
  try {
    const { originCountry, destinationCountry } = req.query;

    if (!originCountry) {
      throw new AppError('Origin country is required', 400);
    }

    const country = originCountry as string;
    const requirements = attestationRequirements[country as keyof typeof attestationRequirements];

    if (!requirements) {
      throw new AppError(`Attestation requirements not available for ${country}`, 404);
    }

    // Add destination-specific note if applicable
    let destinationNote = null;
    if (destinationCountry) {
      if (destinationCountry === 'UAE' && country === 'Nigeria') {
        destinationNote = 'UAE requires additional embassy attestation after Ministry of Foreign Affairs';
      } else if (destinationCountry === 'Germany' && !requirements.apostilleAvailable) {
        destinationNote = 'Germany accepts embassy legalization as apostille alternative';
      }
    }

    res.json({
      success: true,
      data: {
        ...requirements,
        destinationNote,
      },
      message: 'Attestation steps retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to get attestation steps', { error: error.message });
    throw new AppError(error.message || 'Failed to get attestation steps', 500);
  }
}

/**
 * Generate personalized credential evaluation guide using AI
 */
export async function generateCredentialGuide(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { originCountry, destinationCountry, qualificationLevel, fieldOfStudy, universityName } = req.body;

    if (!originCountry || !destinationCountry || !qualificationLevel || !fieldOfStudy || !universityName) {
      throw new AppError('All fields are required: originCountry, destinationCountry, qualificationLevel, fieldOfStudy, universityName', 400);
    }

    const prompt = `You are an expert in African academic credential evaluation. Generate a step-by-step guide for getting qualifications from ${originCountry} recognised in ${destinationCountry}.

Qualification: ${qualificationLevel} in ${fieldOfStudy}
University: ${universityName}

Include:
1. Which evaluation body to use and why
2. Exact documents needed
3. Attestation steps specific to ${originCountry}
4. Realistic timeline and costs
5. Common mistakes to avoid
6. Any profession-specific requirements

Format as clear numbered sections. Be specific to ${originCountry} applicants.`;

    const result = await openaiService.callOpenAI(
      prompt,
      2000,
      0.7,
      'gpt-4o',
      user?.id,
      'credential_guide'
    );

    res.json({
      success: true,
      data: {
        guide: result.content,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
      },
      message: 'Credential guide generated successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to generate credential guide', { error: error.message });
    throw new AppError(error.message || 'Failed to generate credential guide', 500);
  }
}
