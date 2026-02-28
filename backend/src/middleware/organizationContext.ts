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
 * Check if an organization's trial has expired.
 * If it has, auto-flip planStatus to 'expired' in the DB and throw a 402.
 */
async function checkAndEnforceTrialExpiry(organization: any): Promise<void> {
  if (organization.planStatus !== 'trial') return;

  const now = new Date();
  const trialEndsAt = organization.trialEndsAt ? new Date(organization.trialEndsAt) : null;

  if (trialEndsAt && now > trialEndsAt) {
    // Auto-expire — flip status so next check is instant (no repeated date comparisons)
    await (prisma as any).organization.update({
      where: { id: organization.id },
      data: { planStatus: 'expired' },
    });
    throw new AppError('TRIAL_EXPIRED', 402);
  }
}

/**
 * Core logic — shared by both middleware variants below.
 */
async function resolveOrgContext(
  req: Request,
  allowExpired: boolean
): Promise<void> {
  const user = (req as any).user;

  if (!user) throw new AppError('Authentication required', 401);

  const userId = user.userId || user.id;
  if (!userId) throw new AppError('Authentication required', 401);

  const dbUser = await (prisma as any).user.findUnique({
    where: { id: userId },
    select: { id: true, organizationId: true, role: true },
  });

  if (!dbUser?.organizationId) {
    throw new AppError('User is not associated with an organization', 403);
  }

  const organization = await (prisma as any).organization.findUnique({
    where: { id: dbUser.organizationId },
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

  if (!organization) throw new AppError('Organization not found', 404);

  if (!organization.isActive) throw new AppError('Organization is inactive', 403);

  // ── Trial expiry enforcement ─────────────────────────────────────────────
  if (!allowExpired) {
    await checkAndEnforceTrialExpiry(organization);

    if (organization.planStatus === 'expired') {
      throw new AppError('TRIAL_EXPIRED', 402);
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  req.organizationId = organization.id;
  req.organization = organization;
  req.organizationRole = dbUser.role || 'user';
}

/**
 * Standard middleware — blocks expired-trial organizations.
 * Use on all routes except billing.
 */
export async function organizationContext(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await resolveOrgContext(req, false);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Billing-safe variant — allows expired-trial organizations through
 * so they can still reach payment screens and upload proof of payment.
 */
export async function organizationContextAllowExpired(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await resolveOrgContext(req, true);
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

  if (organization.planStatus === 'expired') {
    throw new AppError('TRIAL_EXPIRED', 402);
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
