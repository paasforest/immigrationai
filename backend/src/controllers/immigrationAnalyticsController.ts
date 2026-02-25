import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Get overview analytics for organization
 * org_admin only
 */
export async function getOverviewAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;

    // Only org_admin can access
    if (organizationRole !== 'org_admin') {
      throw new AppError('Only organization administrators can access analytics', 403);
    }

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Cases this month
    const casesThisMonth = await prisma.case.count({
      where: {
        organizationId,
        createdAt: { gte: startOfThisMonth },
      },
    });

    // Cases last month
    const casesLastMonth = await prisma.case.count({
      where: {
        organizationId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    // Month over month growth
    const monthOverMonthGrowth =
      casesLastMonth > 0
        ? Math.round(((casesThisMonth - casesLastMonth) / casesLastMonth) * 100)
        : casesThisMonth > 0
        ? 100
        : 0;

    // Approval rate
    const approvedCases = await prisma.case.count({
      where: {
        organizationId,
        outcome: 'approved',
      },
    });

    const refusedCases = await prisma.case.count({
      where: {
        organizationId,
        outcome: 'refused',
      },
    });

    const totalDecided = approvedCases + refusedCases;
    const approvalRate = totalDecided > 0 ? Math.round((approvedCases / totalDecided) * 100) : 0;

    // Average case duration (from created to decision)
    const casesWithDecision = await prisma.case.findMany({
      where: {
        organizationId,
        decisionAt: { not: null },
      },
      select: {
        createdAt: true,
        decisionAt: true,
      },
    });

    const avgCaseDuration =
      casesWithDecision.length > 0
        ? Math.round(
            casesWithDecision.reduce((sum, c) => {
              const days =
                (c.decisionAt!.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / casesWithDecision.length
          )
        : 0;

    // Cases by status
    const casesByStatus = await prisma.case.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
    });

    // Cases by visa type
    const casesByVisaType = await prisma.case.groupBy({
      by: ['visaType'],
      where: { organizationId, visaType: { not: null } },
      _count: true,
    });

    // Cases by destination
    const casesByDestination = await prisma.case.groupBy({
      by: ['destinationCountry'],
      where: { organizationId, destinationCountry: { not: null } },
      _count: true,
    });

    // Cases by origin
    const casesByOrigin = await prisma.case.groupBy({
      by: ['originCountry'],
      where: { organizationId, originCountry: { not: null } },
      _count: true,
    });

    // Documents uploaded this month
    const documentsUploaded = await prisma.caseDocument.count({
      where: {
        organizationId,
        createdAt: { gte: startOfThisMonth },
      },
    });

    // Tasks completed this month
    const tasksCompleted = await prisma.task.count({
      where: {
        organizationId,
        status: 'completed',
        updatedAt: { gte: startOfThisMonth },
      },
    });

    // Active clients (unique applicants with open cases)
    const activeClients = await prisma.case.findMany({
      where: {
        organizationId,
        applicantId: { not: null },
        status: { not: 'closed' },
      },
      select: {
        applicantId: true,
      },
      distinct: ['applicantId'],
    });

    res.json({
      success: true,
      data: {
        casesThisMonth,
        casesLastMonth,
        monthOverMonthGrowth,
        approvalRate,
        averageCaseDuration,
        casesByStatus: casesByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
        casesByVisaType: casesByVisaType.map((item) => ({
          visaType: item.visaType || 'Unknown',
          count: item._count,
        })),
        casesByDestination: casesByDestination.map((item) => ({
          country: item.destinationCountry || 'Unknown',
          count: item._count,
        })),
        casesByOrigin: casesByOrigin.map((item) => ({
          country: item.originCountry || 'Unknown',
          count: item._count,
        })),
        documentsUploaded,
        tasksCompleted,
        activeClients: activeClients.length,
      },
      message: 'Overview analytics retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to get overview analytics', { error: error.message });
    throw new AppError(error.message || 'Failed to get overview analytics', 500);
  }
}

/**
 * Get case trends for last 6 months
 */
export async function getCaseTrends(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId!;

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Get all cases from last 6 months
    const cases = await prisma.case.findMany({
      where: {
        organizationId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        outcome: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, { count: number; approved: number; refused: number; monthName: string }> = {};

    cases.forEach((c) => {
      const monthKey = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const monthName = c.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, approved: 0, refused: 0, monthName };
      }

      monthlyData[monthKey].count++;
      if (c.outcome === 'approved') monthlyData[monthKey].approved++;
      if (c.outcome === 'refused') monthlyData[monthKey].refused++;
    });

    // Convert to array and sort
    const trends = Object.entries(monthlyData)
      .map(([key, data]) => ({
        month: data.monthName,
        count: data.count,
        approved: data.approved,
        refused: data.refused,
      }))
      .sort((a, b) => {
        const [aYear, aMonth] = a.month.split(' ');
        const [bYear, bMonth] = b.month.split(' ');
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
      });

    res.json({
      success: true,
      data: trends,
      message: 'Case trends retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to get case trends', { error: error.message });
    throw new AppError(error.message || 'Failed to get case trends', 500);
  }
}

/**
 * Get professional performance stats
 * org_admin only
 */
export async function getProfessionalPerformance(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;

    // Only org_admin can access
    if (organizationRole !== 'org_admin') {
      throw new AppError('Only organization administrators can access professional performance', 403);
    }

    // Get all professionals in the organization
    const professionals = await prisma.user.findMany({
      where: {
        organizationId,
        role: 'professional',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    // Get performance stats for each professional
    const performance = await Promise.all(
      professionals.map(async (prof) => {
        // Active cases (assigned to this professional)
        const activeCases = await prisma.case.count({
          where: {
            organizationId,
            assignedProfessionalId: prof.id,
            status: { not: 'closed' },
          },
        });

        // Completed cases
        const completedCases = await prisma.case.count({
          where: {
            organizationId,
            assignedProfessionalId: prof.id,
            status: 'closed',
          },
        });

        // Approval rate
        const approved = await prisma.case.count({
          where: {
            organizationId,
            assignedProfessionalId: prof.id,
            outcome: 'approved',
          },
        });

        const refused = await prisma.case.count({
          where: {
            organizationId,
            assignedProfessionalId: prof.id,
            outcome: 'refused',
          },
        });

        const totalDecided = approved + refused;
        const approvalRate = totalDecided > 0 ? Math.round((approved / totalDecided) * 100) : 0;

        // Average case duration
        const casesWithDecision = await prisma.case.findMany({
          where: {
            organizationId,
            assignedProfessionalId: prof.id,
            decisionAt: { not: null },
          },
          select: {
            createdAt: true,
            decisionAt: true,
          },
        });

        const avgCaseDuration =
          casesWithDecision.length > 0
            ? Math.round(
                casesWithDecision.reduce((sum, c) => {
                  const days =
                    (c.decisionAt!.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                  return sum + days;
                }, 0) / casesWithDecision.length
              )
            : 0;

        return {
          professionalId: prof.id,
          name: prof.fullName || prof.email,
          activeCases,
          completedCases,
          approvalRate,
          avgCaseDuration,
        };
      })
    );

    // Sort by activeCases descending
    performance.sort((a, b) => b.activeCases - a.activeCases);

    res.json({
      success: true,
      data: performance,
      message: 'Professional performance retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to get professional performance', { error: error.message });
    throw new AppError(error.message || 'Failed to get professional performance', 500);
  }
}
