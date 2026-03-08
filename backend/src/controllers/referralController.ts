import { Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types/request';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { convertIntakeToCase } from '../services/routingEngine';
import { generateCaseReference } from '../utils/referenceNumber';
import { sendProfessionalContactEmail } from '../services/emailService';

/**
 * POST /api/referrals — create a referral (lead or case).
 * Body: { recipientId, intakeId?, caseId?, note?, notifyClient?: boolean }
 * Exactly one of intakeId or caseId required.
 */
export const createReferral = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }

  const { recipientId, intakeId, caseId, note, notifyClient = true } = req.body;

  if (!recipientId) {
    return sendError(res, 'VALIDATION_ERROR', 'recipientId is required', 400);
  }
  if (!!intakeId === !!caseId) {
    return sendError(res, 'VALIDATION_ERROR', 'Provide exactly one of intakeId or caseId', 400);
  }

  const referrerId = req.user.userId;
  if (recipientId === referrerId) {
    return sendError(res, 'VALIDATION_ERROR', 'Cannot refer to yourself', 400);
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, organizationId: true, fullName: true, email: true },
  });
  if (!recipient || !recipient.organizationId) {
    return sendError(res, 'NOT_FOUND', 'Recipient not found or has no organization', 404);
  }

  if (intakeId) {
    const intake = await prisma.caseIntake.findUnique({
      where: { id: intakeId },
      include: { service: true },
    });
    if (!intake) {
      return sendError(res, 'NOT_FOUND', 'Lead not found', 404);
    }
    const myAssignment = await prisma.intakeAssignment.findFirst({
      where: { intakeId, professionalId: referrerId },
    });
    if (!myAssignment) {
      return sendError(res, 'FORBIDDEN', 'You do not have access to this lead', 403);
    }
  } else if (caseId) {
    const c = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, organizationId: true, assignedProfessionalId: true },
    });
    if (!c) {
      return sendError(res, 'NOT_FOUND', 'Case not found', 404);
    }
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
      select: { organizationId: true },
    });
    const canRefer =
      c.assignedProfessionalId === referrerId ||
      referrer?.organizationId === c.organizationId;
    if (!canRefer) {
      return sendError(res, 'FORBIDDEN', 'You do not have access to this case', 403);
    }
  }

  const referral = await prisma.caseReferral.create({
    data: {
      referrerId,
      recipientId,
      intakeId: intakeId || null,
      caseId: caseId || null,
      note: note?.trim() || null,
      status: 'pending',
      clientNotified: false,
    },
    include: {
      referrer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          organizationId: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      intake: intakeId
        ? {
            select: {
              id: true,
              referenceNumber: true,
              applicantName: true,
              applicantEmail: true,
              destinationCountry: true,
              service: { select: { name: true } },
            },
          }
        : undefined,
      case: caseId
        ? {
            select: {
              id: true,
              referenceNumber: true,
              title: true,
              destinationCountry: true,
              applicant: { select: { fullName: true, email: true } },
            },
          }
        : undefined,
    },
  });

  logger.info('Referral created', {
    referralId: referral.id,
    referrerId,
    recipientId,
    intakeId: referral.intakeId ?? undefined,
    caseId: referral.caseId ?? undefined,
  });

  return sendSuccess(res, { referral }, 'Referral sent', 201);
});

/**
 * GET /api/referrals — list referrals (sent and received) for current user.
 */
export const getMyReferrals = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }

  const userId = req.user.userId;
  const referrals = await prisma.caseReferral.findMany({
    where: { OR: [{ referrerId: userId }, { recipientId: userId }] },
    include: {
      referrer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          professionalProfile: {
            select: {
              displayName: true,
              title: true,
              organizationId: true,
            },
          },
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          email: true,
          professionalProfile: {
            select: {
              displayName: true,
              title: true,
            },
          },
        },
      },
      intake: {
        select: {
          id: true,
          referenceNumber: true,
          applicantName: true,
          applicantEmail: true,
          destinationCountry: true,
          service: { select: { name: true } },
        },
      },
      case: {
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          destinationCountry: true,
          applicant: { select: { fullName: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const sent = referrals.filter((r: { referrerId: string }) => r.referrerId === userId);
  const received = referrals.filter((r: { recipientId: string }) => r.recipientId === userId);

  return sendSuccess(
    res,
    { sent, received, all: referrals },
    'Referrals retrieved'
  );
});

/**
 * POST /api/referrals/:id/accept — accept a referral (recipient only).
 */
export const acceptReferral = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }

  const { id } = req.params;
  const userId = req.user.userId;

  const referral = await prisma.caseReferral.findUnique({
    where: { id },
    include: {
      referrer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          organization: { select: { name: true } },
        },
      },
      recipient: { select: { id: true, fullName: true, email: true, organizationId: true } },
      intake: {
        include: { service: true },
      },
      case: {
        select: {
          id: true,
          applicantId: true,
          title: true,
          visaType: true,
          originCountry: true,
          destinationCountry: true,
          notes: true,
          priority: true,
          applicant: { select: { email: true, fullName: true } },
        },
      },
    },
  });

  if (!referral) {
    return sendError(res, 'NOT_FOUND', 'Referral not found', 404);
  }
  if (referral.recipientId !== userId) {
    return sendError(res, 'FORBIDDEN', 'Only the recipient can accept this referral', 403);
  }
  if (referral.status !== 'pending') {
    return sendError(res, 'VALIDATION_ERROR', 'Referral is no longer pending', 400);
  }

  let newCase: { id: string; referenceNumber: string } | null = null;
  let clientEmail: string | null = null;
  let clientName: string | null = null;
  let serviceName = '';

  if (referral.intakeId && referral.intake) {
    const result = await convertIntakeToCase(referral.intakeId, userId);
    newCase = { id: result.id, referenceNumber: result.referenceNumber };
    clientEmail = referral.intake.applicantEmail;
    clientName = referral.intake.applicantName;
    serviceName = referral.intake.service?.name || 'Case';
  } else if (referral.caseId && referral.case) {
    const orig = referral.case;
    const recipientOrgId = referral.recipient.organizationId;
    if (!recipientOrgId) {
      return sendError(res, 'VALIDATION_ERROR', 'Recipient has no organization', 400);
    }
    const referenceNumber = await generateCaseReference();
    const created = await prisma.case.create({
      data: {
        organizationId: recipientOrgId,
        assignedProfessionalId: userId,
        applicantId: orig.applicantId || undefined,
        referenceNumber,
        title: orig.title,
        visaType: orig.visaType,
        originCountry: orig.originCountry,
        destinationCountry: orig.destinationCountry,
        notes: orig.notes,
        priority: orig.priority || 'normal',
        status: 'open',
      },
    });
    newCase = { id: created.id, referenceNumber: created.referenceNumber };
    serviceName = orig.title;
    if (orig.applicant) {
      clientEmail = orig.applicant.email;
      clientName = orig.applicant.fullName || null;
      if (orig.applicantId) {
        await prisma.user.update({
          where: { id: orig.applicantId },
          data: { organizationId: recipientOrgId },
        });
      }
    }
  }

  await prisma.caseReferral.update({
    where: { id },
    data: {
      status: 'accepted',
      respondedAt: new Date(),
      clientNotified: false,
    },
  });

  if (newCase && clientEmail && clientName) {
    setImmediate(async () => {
      try {
        const prof = await prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true, email: true, phone: true },
        });
        const profile = await prisma.professionalProfile.findUnique({
          where: { userId },
          select: { title: true },
        });
        await sendProfessionalContactEmail({
          toEmail: clientEmail!,
          applicantName: clientName!,
          professionalName: prof?.fullName || prof?.email?.split('@')[0] || 'Your specialist',
          professionalTitle: profile?.title ?? undefined,
          professionalEmail: prof?.email || '',
          professionalPhone: prof?.phone ?? undefined,
          serviceName,
          caseReference: newCase!.referenceNumber,
          preferredLanguage: null,
        });
        await prisma.caseReferral.update({
          where: { id },
          data: { clientNotified: true },
        });
      } catch (err: any) {
        logger.error('Referral accept: failed to notify client', { error: err.message, referralId: id });
      }
    });
  }

  return sendSuccess(
    res,
    { referral: { ...referral, status: 'accepted' }, newCase },
    'Referral accepted'
  );
});

/**
 * POST /api/referrals/:id/decline — decline a referral (recipient only).
 */
export const declineReferral = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }

  const { id } = req.params;
  const userId = req.user.userId;

  const referral = await prisma.caseReferral.findUnique({
    where: { id },
  });

  if (!referral) {
    return sendError(res, 'NOT_FOUND', 'Referral not found', 404);
  }
  if (referral.recipientId !== userId) {
    return sendError(res, 'FORBIDDEN', 'Only the recipient can decline this referral', 403);
  }
  if (referral.status !== 'pending') {
    return sendError(res, 'VALIDATION_ERROR', 'Referral is no longer pending', 400);
  }

  await prisma.caseReferral.update({
    where: { id },
    data: {
      status: 'declined',
      respondedAt: new Date(),
    },
  });

  return sendSuccess(res, { referral: { ...referral, status: 'declined' } }, 'Referral declined');
});
