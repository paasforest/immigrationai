import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from './errorHandler';

// Extend Express Request type to include organization context
declare global {
  namespace Express {
    interface Request {
      organizationId?: string;
      organization?: any;
      organizationRole?: string;
    }
  }
}

/**
 * Middleware to extract and validate organization context
 * Must run AFTER JWT auth middleware (which sets req.user)
 */
export async function organizationContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get authenticated user from JWT middleware
    const user = (req as any).user;
    
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    // Get user's organizationId
    const organizationId = user.organizationId;

    if (!organizationId) {
      throw new AppError('User is not associated with an organization', 403);
    }

    // Fetch organization and verify it exists and is active
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        planStatus: true,
        trialEndsAt: true,
        isActive: true,
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    if (!organization.isActive) {
      throw new AppError('Organization is inactive', 403);
    }

    // Get user's role in the organization
    const userInOrg = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        role: true,
        organizationId: true,
      },
    });

    // Attach organization context to request
    req.organizationId = organization.id;
    req.organization = organization;
    req.organizationRole = userInOrg?.role || 'user';

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to verify organization is not suspended
 */
export function requireActiveOrganization(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const organization = req.organization;

  if (!organization) {
    throw new AppError('Organization context required', 500);
  }

  if (organization.planStatus === 'suspended' || organization.planStatus === 'cancelled') {
    throw new AppError('Organization subscription is suspended or cancelled', 403);
  }

  next();
}

/**
 * Middleware to verify resource belongs to organization
 */
export function verifyOrganizationAccess(
  resourceOrganizationId: string | null | undefined
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const userOrgId = req.organizationId;

    if (!userOrgId) {
      throw new AppError('Organization context required', 500);
    }

    if (!resourceOrganizationId || resourceOrganizationId !== userOrgId) {
      throw new AppError('Access denied: Resource does not belong to your organization', 403);
    }

    next();
  };
}
