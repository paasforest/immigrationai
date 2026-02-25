import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { getCaseById } from '../helpers/prismaScopes';

/**
 * Send a message for a case
 * Applicants cannot send internal messages
 */
export async function sendMessage(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { caseId, content, isInternal = false } = req.body;

    if (!content) {
      throw new AppError('Message content is required', 400);
    }

    if (!caseId) {
      throw new AppError('Case ID is required', 400);
    }

    // Applicants cannot send internal messages
    const finalIsInternal = organizationRole === 'applicant' ? false : isInternal;

    // Validate case belongs to organization
    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) {
      throw new AppError('Case not found or access denied', 404);
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        caseId,
        organizationId,
        senderId: user.id,
        content,
        isInternal: finalIsInternal,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, email: true, role: true, avatarUrl: true },
        },
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.id,
        action: 'message_sent',
        resourceType: 'message',
        resourceId: message.id,
        metadata: {
          caseId,
          isInternal: finalIsInternal,
        },
      },
    });

    // Create notification if message is from applicant to professional
    if (organizationRole === 'applicant' && caseData.assignedProfessionalId) {
      try {
        const { createNotification } = await import('./notificationController');
        await createNotification({
          organizationId,
          userId: caseData.assignedProfessionalId,
          type: 'new_message',
          title: `New message from ${user.fullName || 'Applicant'}`,
          body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          resourceType: 'message',
          resourceId: message.id,
        });
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to send message', 500);
  }
}

/**
 * Get messages for a case
 * Applicants only see non-internal messages
 * Professionals and org_admin see all messages
 */
export async function getMessagesByCase(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { caseId } = req.params;
    const { page = '1', limit = '50' } = req.query;

    // Validate case belongs to organization
    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) {
      throw new AppError('Case not found or access denied', 404);
    }

    // Build where clause
    const where: any = {
      caseId,
      organizationId,
    };

    // Applicants only see non-internal messages
    if (organizationRole === 'applicant') {
      where.isInternal = false;
    }

    // Get messages with pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: { id: true, fullName: true, email: true, role: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limitNum,
      }),
      prisma.message.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      message: 'Messages retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve messages', 500);
  }
}

/**
 * Mark messages as read
 * Sets readAt to now() for messages where readAt is null
 */
export async function markMessagesRead(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      throw new AppError('Message IDs array is required', 400);
    }

    // Get messages that belong to user's organization and are unread
    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
        organizationId,
        readAt: null,
      },
      select: { id: true, caseId: true },
    });

    // Filter: Applicants can only mark messages for their own cases
    const organizationRole = req.organizationRole!;
    let accessibleMessageIds = messageIds;

    if (organizationRole === 'applicant') {
      const userCases = await prisma.case.findMany({
        where: {
          organizationId,
          applicantId: user.id,
        },
        select: { id: true },
      });
      const userCaseIds = userCases.map((c) => c.id);
      accessibleMessageIds = messages
        .filter((m) => userCaseIds.includes(m.caseId))
        .map((m) => m.id);
    } else {
      accessibleMessageIds = messages.map((m) => m.id);
    }

    // Update messages
    await prisma.message.updateMany({
      where: {
        id: { in: accessibleMessageIds },
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: { markedCount: accessibleMessageIds.length },
      message: 'Messages marked as read',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to mark messages as read', 500);
  }
}

/**
 * Get unread message count for current user
 * Scoped to their organization's cases
 */
export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;

    // Build where clause
    const where: any = {
      organizationId,
      readAt: null,
    };

    // Applicants only see unread messages for their own cases
    if (organizationRole === 'applicant') {
      const userCases = await prisma.case.findMany({
        where: {
          organizationId,
          applicantId: user.id,
        },
        select: { id: true },
      });
      const userCaseIds = userCases.map((c) => c.id);
      where.caseId = { in: userCaseIds };
      where.isInternal = false; // Applicants don't see internal messages
    }

    const unreadCount = await prisma.message.count({ where });

    res.json({
      success: true,
      data: { unreadCount },
      message: 'Unread count retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve unread count', 500);
  }
}
