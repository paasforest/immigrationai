import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { generateCaseReference } from '../utils/referenceNumber';
import { getUsersByOrg } from '../helpers/prismaScopes';
import crypto from 'crypto';

/**
 * Create a new organization
 * Called during agency registration/onboarding
 */
export async function createOrganization(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user; // From JWT middleware
    const { name, billingEmail, country, phone } = req.body;

    if (!name) {
      throw new AppError('Organization name is required', 400);
    }

    // Generate slug from name (lowercase, hyphens, unique)
    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure slug is unique
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug: uniqueSlug,
        billingEmail,
        country,
        phone,
        plan: 'starter',
        planStatus: 'trial',
        trialEndsAt,
        isActive: true,
      },
    });

    // Create trial subscription
    await prisma.subscription.create({
      data: {
        organizationId: organization.id,
        plan: 'starter',
        status: 'trial',
        billingCycle: 'monthly',
        currency: 'ZAR',
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
      },
    });

    // Update user's organizationId and set role to org_admin
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: organization.id,
        role: 'org_admin',
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        action: 'organization_created',
        resourceType: 'organization',
        resourceId: organization.id,
        metadata: { name, slug: uniqueSlug },
      },
    });

    res.status(201).json({
      success: true,
      data: organization,
      message: 'Organization created successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to create organization', 500);
  }
}

/**
 * Get current user's organization details
 */
export async function getMyOrganization(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user.organizationId) {
      throw new AppError('User is not associated with an organization', 404);
    }

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    // Calculate trial days remaining
    let trialDaysRemaining = null;
    if (organization.planStatus === 'trial' && organization.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(organization.trialEndsAt);
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      trialDaysRemaining = diffDays > 0 ? diffDays : 0;
    }

    res.json({
      success: true,
      data: {
        ...organization,
        trialDaysRemaining,
      },
      message: 'Organization retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve organization', 500);
  }
}

/**
 * Update organization profile
 * Only org_admin can update
 */
export async function updateMyOrganization(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { name, billingEmail, country, phone, logoUrl } = req.body;

    if (!user.organizationId) {
      throw new AppError('User is not associated with an organization', 404);
    }

    // Verify user is org_admin
    if (user.role !== 'org_admin') {
      throw new AppError('Only organization administrators can update organization profile', 403);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (billingEmail !== undefined) updateData.billingEmail = billingEmail;
    if (country !== undefined) updateData.country = country;
    if (phone !== undefined) updateData.phone = phone;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;

    // If name changed, regenerate slug
    if (name) {
      let slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let uniqueSlug = slug;
      let counter = 1;
      while (
        await prisma.organization.findFirst({
          where: {
            slug: uniqueSlug,
            id: { not: user.organizationId },
          },
        })
      ) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      updateData.slug = uniqueSlug;
    }

    const organization = await prisma.organization.update({
      where: { id: user.organizationId },
      data: updateData,
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        action: 'organization_updated',
        resourceType: 'organization',
        resourceId: organization.id,
        metadata: updateData,
      },
    });

    res.json({
      success: true,
      data: organization,
      message: 'Organization updated successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to update organization', 500);
  }
}

/**
 * Get all users in the organization
 * Only org_admin can access
 */
export async function getOrganizationUsers(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user.organizationId) {
      throw new AppError('User is not associated with an organization', 404);
    }

    // Verify user is org_admin
    if (user.role !== 'org_admin') {
      throw new AppError('Only organization administrators can view users', 403);
    }

    const users = await getUsersByOrg(user.organizationId);

    res.json({
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve users', 500);
  }
}

/**
 * Invite a new professional to the organization
 * Only org_admin can invite
 */
export async function inviteUser(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { email, firstName, lastName, role } = req.body;

    if (!user.organizationId) {
      throw new AppError('User is not associated with an organization', 404);
    }

    // Verify user is org_admin
    if (user.role !== 'org_admin') {
      throw new AppError('Only organization administrators can invite users', 403);
    }

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists, add them to organization
      if (existingUser.organizationId) {
        throw new AppError('User is already associated with an organization', 400);
      }

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          organizationId: user.organizationId,
          role: role || 'professional',
          isActive: false, // User must accept invitation first
        },
      });

      // Send invitation email
      try {
        const { sendInvitationEmail } = await import('../services/emailService');
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/signup?token=${inviteToken}`;
        await sendInvitationEmail({
          toEmail: email,
          toName: `${firstName || ''} ${lastName || ''}`.trim() || undefined,
          inviterName: user.fullName || user.email,
          organizationName: organization.name,
          inviteUrl,
          role: role || 'professional',
        });
      } catch (error) {
        console.error('Failed to send invitation email:', error);
      }

      res.json({
        success: true,
        data: { userId: existingUser.id, email },
        message: 'User added to organization successfully',
      });
    } else {
      // Create new user (inactive until they accept invitation)
      // Generate invitation token
      const inviteToken = crypto.randomBytes(32).toString('hex');
      
      // Create user as inactive
      const newUser = await prisma.user.create({
        data: {
          email,
          fullName: `${firstName || ''} ${lastName || ''}`.trim() || null,
          passwordHash: '', // Will be set when they accept invitation
          organizationId: user.organizationId,
          role: role || 'professional',
          isActive: false,
          subscriptionPlan: 'starter',
          subscriptionStatus: 'inactive',
        },
      });

      // Send invitation email
      try {
        const { sendInvitationEmail } = await import('../services/emailService');
        const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/signup?token=${inviteToken}`;
        await sendInvitationEmail({
          toEmail: email,
          toName: `${firstName || ''} ${lastName || ''}`.trim() || undefined,
          inviterName: user.fullName || user.email,
          organizationName: organization.name,
          inviteUrl,
          role: role || 'professional',
        });
      } catch (error) {
        console.error('Failed to send invitation email:', error);
      }

      res.json({
        success: true,
        data: { userId: newUser.id, email },
        message: 'Invitation sent successfully',
      });
    }

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'user_invited',
        resourceType: 'user',
        metadata: { email, role },
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to invite user', 500);
  }
}

/**
 * Update a user's role or status within the organization
 * Only org_admin can update
 */
export async function updateOrganizationUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = (req as any).user;
    const { userId } = req.params;
    const { role, isActive } = req.body;

    if (!user.organizationId) {
      throw new AppError('User is not associated with an organization', 404);
    }

    // Verify user is org_admin
    if (user.role !== 'org_admin') {
      throw new AppError('Only organization administrators can update users', 403);
    }

    // Cannot demote yourself
    if (userId === user.id && role && role !== 'org_admin') {
      throw new AppError('You cannot change your own role', 400);
    }

    // Verify target user belongs to same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: user.organizationId,
      },
    });

    if (!targetUser) {
      throw new AppError('User not found or does not belong to your organization', 404);
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'user_updated',
        resourceType: 'user',
        resourceId: userId,
        metadata: updateData,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to update user', 500);
  }
}

/**
 * Check if user needs onboarding
 * Returns whether the current user needs onboarding
 */
export async function checkOnboardingStatus(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    // If user is applicant, they don't need onboarding
    if (user.role === 'applicant') {
      res.json({
        success: true,
        data: {
          needsOnboarding: false,
          organization: null,
        },
      });
      return;
    }

    // If user has organizationId, they're already onboarded
    if (user.organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: user.organizationId },
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

      res.json({
        success: true,
        data: {
          needsOnboarding: false,
          organization: organization || null,
        },
      });
      return;
    }

    // User needs onboarding
    res.json({
      success: true,
      data: {
        needsOnboarding: true,
        organization: null,
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to check onboarding status', 500);
  }
}

/**
 * Complete onboarding flow
 * Creates organization and sets up trial subscription
 */
export async function completeOnboarding(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    // Cannot onboard if already part of organization
    if (user.organizationId) {
      throw new AppError('User is already part of an organization', 400);
    }

    // Cannot onboard if applicant
    if (user.role === 'applicant') {
      throw new AppError('Applicants cannot create organizations', 403);
    }

    const {
      organizationName,
      country,
      phone,
      billingEmail,
      teamSize,
      primaryUseCase,
      hearAboutUs,
    } = req.body;

    if (!organizationName || !country || !billingEmail) {
      throw new AppError('Organization name, country, and billing email are required', 400);
    }

    // Generate slug from name
    let slug = organizationName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure slug is unique
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.organization.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: uniqueSlug,
        billingEmail,
        country,
        phone: phone || null,
        plan: 'starter',
        planStatus: 'trial',
        trialEndsAt,
        isActive: true,
      },
    });

    // Update user to be org_admin and link to organization
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: organization.id,
        role: 'org_admin',
      },
    });

    // Create subscription record
    const subscription = await prisma.subscription.create({
      data: {
        organizationId: organization.id,
        plan: 'starter',
        status: 'trial',
        amount: 0,
        currency: 'ZAR',
        billingCycle: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        action: 'onboarding_completed',
        resourceType: 'organization',
        resourceId: organization.id,
        metadata: {
          organizationName,
          country,
          teamSize,
          primaryUseCase,
        },
      },
    });

    // Send welcome email
    try {
      const { sendWelcomeEmail } = await import('../services/emailService');
      const firstName = user.fullName?.split(' ')[0] || 'there';
      await sendWelcomeEmail({
        toEmail: user.email,
        firstName,
        organizationName,
        dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/immigration`,
      });
    } catch (error) {
      // Email failure shouldn't break onboarding
      console.error('Failed to send welcome email:', error);
    }

    res.json({
      success: true,
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          plan: organization.plan,
          planStatus: organization.planStatus,
          trialEndsAt: organization.trialEndsAt,
        },
        subscription: {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEndsAt: subscription.trialEndsAt,
        },
      },
      message: 'Onboarding completed successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to complete onboarding', 500);
  }
}
