import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { getCaseById } from '../helpers/prismaScopes';

/**
 * Create a new task
 * Only org_admin and professional can create tasks
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { caseId, title, description, assignedToId, priority = 'normal', dueDate } = req.body;

    // Check permissions
    if (organizationRole !== 'org_admin' && organizationRole !== 'professional') {
      throw new AppError('Only organization administrators and professionals can create tasks', 403);
    }

    if (!title) {
      throw new AppError('Task title is required', 400);
    }

    if (!caseId) {
      throw new AppError('Case ID is required', 400);
    }

    // Validate case belongs to organization
    const caseData = await getCaseById(organizationId, caseId);
    if (!caseData) {
      throw new AppError('Case not found or access denied', 404);
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        caseId,
        organizationId,
        createdById: user.userId,
        title,
        description,
        priority,
        status: 'pending',
        ...(assignedToId && {
          assignedTo: {
            connect: { id: assignedToId },
          },
        }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
      include: {
        assignedTo: {
          select: { id: true, fullName: true, email: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.userId,
          action: 'task_created',
        resourceType: 'task',
        resourceId: task.id,
        metadata: {
          caseId,
          title: task.title,
          priority: task.priority,
        },
      },
    });

    // Create notification if task is assigned to someone
    if (assignedToId && assignedToId !== user.userId) {
      try {
        const { createNotification } = await import('./notificationController');
        await createNotification({
          organizationId,
          userId: assignedToId,
          type: 'task_due',
          title: `New task assigned: ${task.title}`,
          body: description ? (description.substring(0, 100) + (description.length > 100 ? '...' : '')) : 'No description',
          resourceType: 'task',
          resourceId: task.id,
        });
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to create task', 500);
  }
}

/**
 * Get all tasks for a case
 * Filterable by status, priority, assignedToId
 */
export async function getTasksByCase(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId!;
    const { caseId } = req.params;
    const { status, priority, assignedToId } = req.query;

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

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    // Get tasks
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, fullName: true, email: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' },
      ],
    });

    res.json({
      success: true,
      data: tasks,
      message: 'Tasks retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve tasks', 500);
  }
}

/**
 * Update task
 * Any professional in the org can update tasks
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const { id } = req.params;
    const { title, description, assignedToId, priority, dueDate, status } = req.body;

    // Get current task
    const currentTask = await prisma.task.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!currentTask) {
      throw new AppError('Task not found or access denied', 404);
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (assignedToId !== undefined) {
      if (assignedToId) {
        updateData.assignedTo = {
          connect: { id: assignedToId },
        };
      } else {
        updateData.assignedTo = { disconnect: true };
      }
    }

    // Handle status change
    if (status !== undefined) {
      updateData.status = status;
      // If status changes to 'completed', set completedAt
      if (status === 'completed' && currentTask.status !== 'completed') {
        updateData.completedAt = new Date();
      } else if (status !== 'completed') {
        updateData.completedAt = null;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, fullName: true, email: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Log status changes to audit
    if (status && status !== currentTask.status) {
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: user.userId,
          action: 'task_status_changed',
          resourceType: 'task',
          resourceId: id,
          metadata: {
            before: currentTask.status,
            after: status,
            title: updatedTask.title,
          },
        },
      });
    }

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to update task', 500);
  }
}

/**
 * Delete task
 * Only org_admin can delete tasks
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;
    const { id } = req.params;

    // Only org_admin can delete
    if (organizationRole !== 'org_admin') {
      throw new AppError('Only organization administrators can delete tasks', 403);
    }

    // Get task
    const task = await prisma.task.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!task) {
      throw new AppError('Task not found or access denied', 404);
    }

    // Delete task
    await prisma.task.delete({
      where: { id },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: user.userId,
          action: 'task_deleted',
        resourceType: 'task',
        resourceId: id,
        metadata: { title: task.title },
      },
    });

    res.json({
      success: true,
      data: { id },
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to delete task', 500);
  }
}

/**
 * Get upcoming deadlines (tasks due in next 7 days)
 * Professional sees only their assigned tasks
 * org_admin sees all
 */
export async function getUpcomingDeadlines(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const organizationId = req.organizationId!;
    const organizationRole = req.organizationRole!;

    // Calculate date range (next 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Build where clause
    const where: any = {
      organizationId,
      dueDate: {
        gte: now,
        lte: sevenDaysFromNow,
      },
      status: {
        not: 'completed',
      },
    };

    // Professional sees only their assigned tasks
    if (organizationRole === 'professional') {
      where.assignedToId = user.userId;
    }

    // Get tasks
    const tasks = await prisma.task.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            title: true,
            referenceNumber: true,
          },
        },
        assignedTo: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json({
      success: true,
      data: tasks,
      message: 'Upcoming deadlines retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve upcoming deadlines', 500);
  }
}

/**
 * Get all tasks for organization (not scoped to a case)
 */
export async function getAllTasksByOrg(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId!;
    const { status, priority, assignedToId, page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {
      organizationId,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    // Get tasks with case info
    const tasks = await prisma.task.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            referenceNumber: true,
            title: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    res.json({
      success: true,
      data: tasks,
      message: 'Tasks retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to get tasks', 500);
  }
}
