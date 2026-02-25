import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { vacCentres, vacTips, bookingLinks } from '../data/vacData';

/**
 * Get VAC centres filtered by country and destination
 */
export async function getVACCentres(req: Request, res: Response): Promise<void> {
  try {
    const { country, destination } = req.query;

    let filteredCentres = vacCentres;

    // Filter by origin country
    if (country) {
      filteredCentres = filteredCentres.filter(
        (centre) => centre.country.toLowerCase() === (country as string).toLowerCase()
      );
    }

    // Filter by destination
    if (destination) {
      filteredCentres = filteredCentres.filter((centre) =>
        centre.servesDestinations.includes(destination as string)
      );
    }

    res.json({
      success: true,
      data: filteredCentres,
      message: 'VAC centres retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to get VAC centres', { error: error.message });
    throw new AppError(error.message || 'Failed to get VAC centres', 500);
  }
}

/**
 * Get wait times for a specific city and destination
 */
export async function getWaitTimes(req: Request, res: Response): Promise<void> {
  try {
    const { originCity, destination } = req.query;

    if (!originCity || !destination) {
      throw new AppError('Origin city and destination are required', 400);
    }

    const city = (originCity as string).toLowerCase();
    const dest = destination as string;

    // Find matching centres
    const matchingCentres = vacCentres.filter(
      (centre) =>
        centre.city.toLowerCase() === city && centre.servesDestinations.includes(dest)
    );

    if (matchingCentres.length === 0) {
      res.json({
        success: true,
        data: {
          waitTime: null,
          tips: vacTips[dest] || [],
          disclaimer: 'Wait times are approximate and change frequently — always check official booking portal',
        },
        message: 'No VAC centres found for this combination',
      });
      return;
    }

    // Get average wait time (use first matching centre's wait time)
    const waitTime = matchingCentres[0].averageWaitDays[dest] || null;
    const tips = vacTips[dest] || [];

    res.json({
      success: true,
      data: {
        waitTime,
        centres: matchingCentres,
        tips,
        disclaimer: 'Wait times shown are estimates based on community reports and may not reflect current availability. Always check the official booking portal for real-time slots.',
      },
      message: 'Wait times retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to get wait times', { error: error.message });
    throw new AppError(error.message || 'Failed to get wait times', 500);
  }
}

/**
 * Get booking links for a destination
 */
export async function getBookingLinks(req: Request, res: Response): Promise<void> {
  try {
    const { destination } = req.query;

    if (!destination) {
      // Return all booking links
      res.json({
        success: true,
        data: bookingLinks,
        message: 'Booking links retrieved successfully',
      });
      return;
    }

    const link = bookingLinks[destination as string];

    if (!link) {
      throw new AppError(`Booking link not available for ${destination}`, 404);
    }

    res.json({
      success: true,
      data: {
        destination,
        url: link,
      },
      message: 'Booking link retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to get booking links', { error: error.message });
    throw new AppError(error.message || 'Failed to get booking links', 500);
  }
}
