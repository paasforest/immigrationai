import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

/**
 * Get notifications for current user
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const { unreadOnly, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      userId: user.userId,
      organizationId,
    };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      message: 'Notifications retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to get notifications', 500);
  }
}

/**
 * Mark notification(s) as read
 */
export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const { id } = req.body;

    if (!id) {
      throw new AppError('Notification ID is required', 400);
    }

    if (id === 'all') {
      // Mark all user's notifications as read
      const result = await prisma.notification.updateMany({
        where: {
          userId: user.userId,
          organizationId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: { count: result.count },
        message: `${result.count} notifications marked as read`,
      });
    } else {
      // Mark single notification as read
      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId: user.userId,
          organizationId,
        },
      });

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      await prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    }
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to mark notification as read', 500);
  }
}

/**
 * Create a notification (internal service function)
 */
export async function createNotification(data: {
  organizationId: string;
  userId: string;
  type: 'new_message' | 'task_due' | 'case_update' | 'document_uploaded' | 'deadline_approaching';
  title: string;
  body: string;
  resourceType?: 'case' | 'task' | 'document' | 'message';
  resourceId?: string;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        resourceType: data.resourceType || null,
        resourceId: data.resourceId || null,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notifications are non-critical
  }
}
