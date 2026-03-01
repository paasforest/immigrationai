import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { generateCaseReference } from '../utils/referenceNumber';
import { getCasesByOrg, getCaseById, createCase, updateCase, deleteCase } from '../helpers/prismaScopes';
import { Prisma } from '@prisma/client';

/**
 * Create a new case
 * Only org_admin and professional roles can create cases
 */
export async function createCaseHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;

    // Check permissions
    if (organizationRole !== 'org_admin' && organizationRole !== 'professional') {
      throw new AppError('Only organization administrators and professionals can create cases', 403);
    }

    const {
      title,
      visaType,
      originCountry,
      destinationCountry,
      applicantId,
      assignedProfessionalId,
      priority = 'normal',
      submissionDeadline,
      notes,
    } = req.body;

    if (!title) {
      throw new AppError('Case title is required', 400);
    }

    // Generate unique reference number
    const referenceNumber = await generateCaseReference();

    // Create case data
    const caseData: Prisma.CaseCreateInput = {
      title,
      referenceNumber,
      visaType,
      originCountry,
      destinationCountry,
      priority,
      notes,
      status: 'open',
      organization: {
        connect: { id: organizationId },
      },
      ...(submissionDeadline && { submissionDeadline: new Date(submissionDeadline) }),
      ...(assignedProfessionalId && {
        assignedProfessional: {
          connect: { id: assignedProfessionalId },
        },
      }),
      ...(applicantId && {
        applicant: {
          connect: { id: applicantId },
        },
      }),
    };

    const newCase = await createCase(organizationId, caseData);

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.userId,
        action: 'case_created',
        resourceType: 'case',
        resourceId: newCase.id,
        metadata: {
          referenceNumber: newCase.referenceNumber,
          title: newCase.title,
          visaType: newCase.visaType,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: newCase,
      message: 'Case created successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to create case', 500);
  }
}

/**
 * Get all cases for the organization
 * Supports filtering, pagination, and role-based access
 */
export async function getCases(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;

    const {
      status,
      visaType,
      priority,
      assignedProfessionalId,
      originCountry,
      destinationCountry,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    // Build filters
    const filters: any = {};
    if (status) filters.status = status as string;
    if (visaType) filters.visaType = visaType as string;
    if (assignedProfessionalId) filters.assignedProfessionalId = assignedProfessionalId as string;
    if (originCountry) filters.originCountry = originCountry as string;
    if (destinationCountry) filters.destinationCountry = destinationCountry as string;
    if (search) filters.search = search as string;

    // Applicant can only see their own cases
    if (organizationRole === 'applicant') {
      filters.applicantId = user.userId;
    }

    // Get cases using scoped helper
    const cases = await getCasesByOrg(organizationId, filters);

    // Apply pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedCases = cases.slice(startIndex, endIndex);

    // Get total count for pagination metadata
    const totalCases = cases.length;
    const totalPages = Math.ceil(totalCases / limitNum);

    res.json({
      success: true,
      data: {
        data: paginatedCases, // Match PaginatedResponse<T> interface
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCases,
          totalPages,
        },
      },
      message: 'Cases retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve cases', 500);
  }
}

/**
 * Get single case by ID with full details
 */
export async function getCaseByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;

    const caseData = await getCaseById(organizationId, id);

    if (!caseData) {
      throw new AppError('Case not found', 404);
    }

    // Applicant can only access their own case
    if (organizationRole === 'applicant' && caseData.applicantId !== user.userId) {
      throw new AppError('Access denied: You can only view your own cases', 403);
    }

    // Filter messages for applicants (hide internal messages)
    let messages = caseData.messages || [];
    if (organizationRole === 'applicant') {
      messages = messages.filter((msg: any) => !msg.isInternal);
    }

    res.json({
      success: true,
      data: {
        ...caseData,
        messages,
      },
      message: 'Case retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve case', 500);
  }
}

/**
 * Update case
 * Only org_admin and professional can update
 */
export async function updateCaseHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;

    // Check permissions
    if (organizationRole !== 'org_admin' && organizationRole !== 'professional') {
      throw new AppError('Only organization administrators and professionals can update cases', 403);
    }

    // Get current case to log changes
    const currentCase = await getCaseById(organizationId, id);
    if (!currentCase) {
      throw new AppError('Case not found', 404);
    }

    const {
      title,
      status,
      visaType,
      priority,
      submissionDeadline,
      assignedProfessionalId,
      notes,
      outcome,
      submittedAt,
      decisionAt,
    } = req.body;

    // Build update data
    const updateData: Prisma.CaseUpdateInput = {};
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (visaType !== undefined) updateData.visaType = visaType;
    if (priority !== undefined) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (outcome !== undefined) updateData.outcome = outcome;
    if (submissionDeadline !== undefined) {
      updateData.submissionDeadline = submissionDeadline ? new Date(submissionDeadline) : null;
    }
    if (submittedAt !== undefined) {
      updateData.submittedAt = submittedAt ? new Date(submittedAt) : null;
    }
    if (decisionAt !== undefined) {
      updateData.decisionAt = decisionAt ? new Date(decisionAt) : null;
    }
    if (assignedProfessionalId !== undefined) {
      if (assignedProfessionalId) {
        updateData.assignedProfessional = {
          connect: { id: assignedProfessionalId },
        };
      } else {
        updateData.assignedProfessional = { disconnect: true };
      }
    }

    const updatedCase = await updateCase(organizationId, id, updateData);

    // Log changes to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.userId,
        action: 'case_updated',
        resourceType: 'case',
        resourceId: id,
        metadata: {
          before: {
            title: currentCase.title,
            status: currentCase.status,
            priority: currentCase.priority,
          },
          after: {
            title: updatedCase.title,
            status: updatedCase.status,
            priority: updatedCase.priority,
          },
        },
      },
    });

    // Create notification and send email if status changed and applicant exists
    if (status && status !== currentCase.status && updatedCase.applicantId) {
      try {
        const { createNotification } = await import('./notificationController');
        await createNotification({
          organizationId,
          userId: updatedCase.applicantId,
          type: 'case_update',
          title: `Case ${updatedCase.referenceNumber} status updated`,
          body: `Your case status has been changed to ${status}`,
          resourceType: 'case',
          resourceId: id,
        });

        // Send email notification
        const applicant = await prisma.user.findUnique({
          where: { id: updatedCase.applicantId },
        });
        if (applicant) {
          const { sendCaseUpdateEmail } = await import('../services/emailService');
          await sendCaseUpdateEmail({
            toEmail: applicant.email,
            toName: applicant.fullName || undefined,
            caseReference: updatedCase.referenceNumber,
            caseTitle: updatedCase.title,
            updateType: 'Status changed',
            updateMessage: `Your case status has been changed to ${status}`,
            caseUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/cases/${id}`,
          });
        }
      } catch (error) {
        console.error('Failed to send case update notification:', error);
      }
    }

    res.json({
      success: true,
      data: updatedCase,
      message: 'Case updated successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to update case', 500);
  }
}

/**
 * Delete case (soft delete - sets status to 'closed')
 * Only org_admin can close cases
 */
export async function deleteCaseHandler(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;

    // Only org_admin can close cases
    if (organizationRole !== 'org_admin') {
      throw new AppError('Only organization administrators can close cases', 403);
    }

    const caseData = await getCaseById(organizationId, id);
    if (!caseData) {
      throw new AppError('Case not found', 404);
    }

    // Soft delete: set status to 'closed'
    const updatedCase = await updateCase(organizationId, id, { status: 'closed' });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.userId,
        action: 'case_closed',
        resourceType: 'case',
        resourceId: id,
        metadata: {
          referenceNumber: caseData.referenceNumber,
          title: caseData.title,
        },
      },
    });

    res.json({
      success: true,
      data: updatedCase,
      message: 'Case closed successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to close case', 500);
  }
}

/**
 * Get case statistics for dashboard
 * Professional sees only their assigned cases
 * org_admin sees all cases
 */
export async function getCaseStats(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;

    // Build where clause based on role
    const where: Prisma.CaseWhereInput = {
      organizationId,
    };

    // Professional sees only their assigned cases
    if (organizationRole === 'professional') {
      where.assignedProfessionalId = user.userId;
    }

    // Get all cases for stats
    const allCases = await prisma.case.findMany({
      where,
      select: {
        status: true,
        priority: true,
        createdAt: true,
        outcome: true,
      },
    });

    // Calculate stats
    const totalCases = allCases.length;
    const openCases = allCases.filter((c) => c.status === 'open').length;
    const inProgressCases = allCases.filter((c) => c.status === 'in_progress').length;
    const submittedCases = allCases.filter((c) => c.status === 'submitted').length;
    const approvedCases = allCases.filter((c) => c.outcome === 'approved').length;
    const refusedCases = allCases.filter((c) => c.outcome === 'refused').length;
    const urgentCases = allCases.filter((c) => c.priority === 'urgent').length;

    // Cases this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const casesThisMonth = allCases.filter(
      (c) => c.createdAt >= startOfMonth
    ).length;

    res.json({
      success: true,
      data: {
        totalCases,
        openCases,
        inProgressCases,
        submittedCases,
        approvedCases,
        refusedCases,
        urgentCases,
        casesThisMonth,
      },
      message: 'Case statistics retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve case statistics', 500);
  }
}

/**
 * Get applicant dashboard data
 * Only accessible to role: applicant
 */
export async function getApplicantDashboard(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;

    // Only applicants can access this endpoint
    if (organizationRole !== 'applicant') {
      throw new AppError('This endpoint is only accessible to applicants', 403);
    }

    // Get active cases for this applicant
    const activeCases = await prisma.case.findMany({
      where: {
        organizationId,
        applicantId: user.userId,
        status: { not: 'closed' },
      },
      include: {
        assignedProfessional: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: {
            caseDocuments: true,
            tasks: true,
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get recent documents across all cases
    const recentDocuments = await prisma.caseDocument.findMany({
      where: {
        organizationId,
        case: {
          applicantId: user.userId,
        },
      },
      include: {
        case: {
          select: { id: true, title: true, referenceNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get pending checklist items (incomplete required items)
    const checklists = await prisma.documentChecklist.findMany({
      where: {
        organizationId,
        case: {
          applicantId: user.userId,
        },
      },
      include: {
        items: {
          where: {
            isRequired: true,
            isCompleted: false,
          },
          include: {
            document: {
              select: { id: true, name: true },
            },
          },
        },
        case: {
          select: { id: true, title: true, referenceNumber: true },
        },
      },
    });

    const pendingChecklistItems = checklists.flatMap((checklist) =>
      checklist.items.map((item) => ({
        ...item,
        checklistName: checklist.name,
        case: checklist.case,
      }))
    );

    // Get unread messages count
    const unreadMessages = await prisma.message.count({
      where: {
        organizationId,
        case: {
          applicantId: user.userId,
        },
        readAt: null,
        senderId: { not: user.userId },
        isInternal: false, // Applicants don't see internal messages
      },
    });

    // Get upcoming deadlines (tasks due in next 14 days)
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        organizationId,
        case: {
          applicantId: user.userId,
        },
        dueDate: {
          lte: fourteenDaysFromNow,
          gte: new Date(),
        },
        status: { not: 'completed' },
      },
      include: {
        case: {
          select: { id: true, title: true, referenceNumber: true },
        },
        assignedTo: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        activeCases,
        recentDocuments,
        pendingChecklistItems,
        unreadMessages,
        upcomingDeadlines,
      },
      message: 'Applicant dashboard data retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve applicant dashboard', 500);
  }
}
