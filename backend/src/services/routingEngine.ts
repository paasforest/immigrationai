import prisma from '../config/prisma';
import { logger } from '../utils/logger';
import { sendLeadNotificationEmail } from './emailService';
import { generateCaseReference } from '../utils/referenceNumber';
import bcrypt from 'bcryptjs';

// ─── Tier Lead Limits ────────────────────────────────────────────────────────
// These are the monthly inbound-lead limits per subscription tier.
// Agency is unlimited (we use Infinity so the comparison always passes).
// These limits apply to NEW leads being ROUTED to a professional.
// Accepted leads already in progress do not count toward the cap.
export const TIER_LEAD_LIMITS: Record<string, number> = {
  starter:      5,
  professional: 20,
  agency:       Infinity,
};

/**
 * Get monthly lead count for a professional.
 * Counts IntakeAssignment records created since the start of the current month.
 */
export async function getMonthlyLeadCount(professionalId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return prisma.intakeAssignment.count({
    where: {
      professionalId,
      assignedAt: { gte: startOfMonth },
    },
  });
}

/**
 * Returns { used, limit, plan, resetDate } for a professional.
 * Used by the /api/intake/lead-usage endpoint.
 */
export async function getLeadUsageForUser(userId: string): Promise<{
  used: number;
  limit: number;
  plan: string;
  resetDate: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true },
  });

  const plan = user?.subscriptionPlan || 'starter';
  const limit = TIER_LEAD_LIMITS[plan] ?? 5;
  const used = await getMonthlyLeadCount(userId);

  // Reset date = first day of next month
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  return {
    used,
    limit: limit === Infinity ? -1 : limit, // -1 = unlimited in API response
    plan,
    resetDate,
  };
}

interface MatchedProfessional {
  user: {
    id: string;
    email: string;
    organizationId: string | null;
    isActive: boolean;
    isIndependentProfessional: boolean;
    fullName: string | null;
    subscriptionPlan: string;
  };
  spec: {
    id: string;
    originCorridors: string[];
    destinationCorridors: string[];
    maxConcurrentLeads: number;
    successRate: number | null;
  };
  score: number;
  activeAssignmentCount: number;
}

/**
 * Find matching professionals for an intake
 */
export async function findMatchingProfessionals(intake: any): Promise<MatchedProfessional[]> {
  try {
    // Fetch all specializations for this service that are accepting leads
    const specializations = await prisma.professionalSpecialization.findMany({
      where: {
        serviceId: intake.serviceId,
        isAcceptingLeads: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            organizationId: true,
            isActive: true,
            isIndependentProfessional: true,
            fullName: true,
            subscriptionPlan: true,   // needed for tier limit check
          },
        },
      },
    });

    // Filter by active users
    const activeSpecs = specializations.filter((spec) => spec.user.isActive === true);

    // ── Skip professionals whose trial has expired ──────────────────────────
    const orgIds = activeSpecs
      .map((s) => s.user.organizationId)
      .filter(Boolean) as string[];

    const orgs = orgIds.length
      ? await prisma.organization.findMany({
          where: { id: { in: orgIds } },
          select: { id: true, planStatus: true, trialEndsAt: true },
        })
      : [];

    const orgStatusMap = new Map(orgs.map((o) => [o.id, o]));

    const eligibleSpecs = activeSpecs.filter((spec) => {
      const org = spec.user.organizationId
        ? orgStatusMap.get(spec.user.organizationId)
        : null;
      if (!org) return true; // independent — no org record, allow through
      if (org.planStatus === 'expired') return false;
      if (org.planStatus === 'trial' && org.trialEndsAt) {
        return new Date() <= new Date(org.trialEndsAt);
      }
      return true;
    });
    // ───────────────────────────────────────────────────────────────────────

    // Apply corridor logic
    const corridorMatches = eligibleSpecs.filter((spec) => {
      const originPass =
        spec.originCorridors.length === 0 || spec.originCorridors.includes(intake.applicantCountry);
      const destinationPass =
        spec.destinationCorridors.length === 0 ||
        spec.destinationCorridors.includes(intake.destinationCountry);
      return originPass && destinationPass;
    });

    // Check concurrent leads limit for each professional
    const matches: MatchedProfessional[] = [];

    for (const spec of corridorMatches) {
      // Count active concurrent assignments
      const activeAssignments = await prisma.intakeAssignment.count({
        where: {
          professionalId: spec.userId,
          status: { in: ['pending', 'accepted'] },
        },
      });

      // Filter out if at concurrent capacity
      if (activeAssignments >= spec.maxConcurrentLeads) {
        continue;
      }

      // ── Tier Monthly Lead Limit ─────────────────────────────────────────
      const plan = (spec.user as any).subscriptionPlan || 'starter';
      const tierLimit = TIER_LEAD_LIMITS[plan] ?? TIER_LEAD_LIMITS['starter'];

      if (tierLimit !== Infinity) {
        const monthlyLeads = await getMonthlyLeadCount(spec.userId);
        if (monthlyLeads >= tierLimit) {
          logger.info(`Routing skip: ${spec.userId} on ${plan} plan has hit monthly limit (${monthlyLeads}/${tierLimit})`);
          continue; // Skip this professional — they've hit their limit
        }
      }

      // Calculate score
      let score = 100;
      if (spec.originCorridors.length > 0) {
        score += 30;
      }
      if (spec.destinationCorridors.length > 0) {
        score += 30;
      }
      if (spec.successRate !== null && spec.successRate >= 80) {
        score += 20;
      }
      score -= activeAssignments * 5;
      if (spec.user.isIndependentProfessional) {
        score += 15;
      }
      // Agency gets priority routing bonus — float to the top of matched list
      if (plan === 'agency') {
        score += 50;
      } else if (plan === 'professional') {
        score += 20;
      }

      matches.push({
        user: {
          ...spec.user,
          subscriptionPlan: (spec.user as any).subscriptionPlan || 'starter',
        },
        spec: {
          id: spec.id,
          originCorridors: spec.originCorridors,
          destinationCorridors: spec.destinationCorridors,
          maxConcurrentLeads: spec.maxConcurrentLeads,
          successRate: spec.successRate,
        },
        score,
        activeAssignmentCount: activeAssignments,
      });
    }

    // Sort by score descending and return top 5
    return matches.sort((a, b) => b.score - a.score).slice(0, 5);
  } catch (error: any) {
    logger.error('Error finding matching professionals', { error: error.message, intakeId: intake.id });
    throw error;
  }
}

/**
 * Assign an intake to a professional
 */
export async function assignIntake(intakeId: string): Promise<any | null> {
  try {
    // Fetch intake with service and assignments
    const intake = await prisma.caseIntake.findUnique({
      where: { id: intakeId },
      include: {
        service: true,
        assignments: {
          select: {
            professionalId: true,
          },
        },
      },
    });

    if (!intake || intake.status !== 'pending_assignment') {
      return null;
    }

    const attemptNumber = intake.assignments.length + 1;

    // Find matching professionals
    const matches = await findMatchingProfessionals(intake);

    // Filter out already tried professionals
    const alreadyTriedIds = intake.assignments.map((a) => a.professionalId);
    const filteredMatches = matches.filter((m) => !alreadyTriedIds.includes(m.user.id));

    if (filteredMatches.length === 0) {
      await prisma.caseIntake.update({
        where: { id: intakeId },
        data: { status: 'no_match_found' },
      });
      logger.warn('No matching professionals for intake', { intakeId });
      return null;
    }

    // Assign to top match
    const winner = filteredMatches[0];

    // Create assignment
    const assignment = await prisma.intakeAssignment.create({
      data: {
        intakeId,
        professionalId: winner.user.id,
        organizationId: winner.user.organizationId,
        status: 'pending',
        attemptNumber,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      },
    });

    // Update intake status
    await prisma.caseIntake.update({
      where: { id: intakeId },
      data: { status: 'assigned' },
    });

    // Send email notification (non-blocking)
    try {
      const professional = await prisma.user.findUnique({
        where: { id: winner.user.id },
        select: {
          email: true,
          fullName: true,
        },
      });

      if (professional) {
        await sendLeadNotificationEmail({
          toEmail: professional.email,
          professionalName: professional.fullName || professional.email.split('@')[0],
          serviceName: intake.service.name,
          applicantCountry: intake.applicantCountry,
          destinationCountry: intake.destinationCountry,
          urgencyLevel: intake.urgencyLevel,
          descriptionPreview: intake.description.slice(0, 200),
          dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/immigration/leads`,
        });
      }
    } catch (emailError: any) {
      logger.error('Lead notification email failed', {
        error: emailError.message || emailError,
        intakeId,
      });
    }

    return assignment;
  } catch (error: any) {
    logger.error('Error assigning intake', { error: error.message, intakeId });
    throw error;
  }
}

/**
 * Reassign an intake to next professional
 */
export async function reassignIntake(intakeId: string): Promise<any | null> {
  try {
    const intake = await prisma.caseIntake.findUnique({
      where: { id: intakeId },
      include: {
        assignments: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!intake) {
      return null;
    }

    // If 5 attempts already made, mark as declined_all
    if (intake.assignments.length >= 5) {
      await prisma.caseIntake.update({
        where: { id: intakeId },
        data: { status: 'declined_all' },
      });
      logger.warn('All 5 professionals declined intake', { intakeId });
      return null;
    }

    return await assignIntake(intakeId);
  } catch (error: any) {
    logger.error('Error reassigning intake', { error: error.message, intakeId });
    throw error;
  }
}

/**
 * Ensure a professional has an organization
 * Creates a personal organization for independent professionals if needed
 */
async function ensurePersonalOrganization(professionalId: string): Promise<string> {
  // Fetch professional with full details
  const professional = await prisma.user.findUnique({
    where: { id: professionalId },
    select: {
      id: true,
      email: true,
      fullName: true,
      organizationId: true,
      isIndependentProfessional: true,
    },
  });

  if (!professional) {
    throw new Error('Professional not found');
  }

  // If professional already has an organization, return it
  if (professional.organizationId) {
    return professional.organizationId;
  }

  // If not an independent professional, throw error (they should have an organization)
  if (!professional.isIndependentProfessional) {
    throw new Error('Professional must be part of an organization');
  }

  // Create personal organization for independent professional
  const orgName = professional.fullName || professional.email.split('@')[0] || 'Independent Professional';
  
  // Generate slug from name
  let slug = orgName
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

  // Create personal organization
  const organization = await prisma.organization.create({
    data: {
      name: `${orgName} (Independent)`,
      slug: uniqueSlug,
      billingEmail: professional.email,
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

  // Update professional's organizationId
  await prisma.user.update({
    where: { id: professionalId },
    data: {
      organizationId: organization.id,
      role: 'org_admin', // Independent professionals become org_admin of their personal org
    },
  });

  logger.info('Created personal organization for independent professional', {
    professionalId,
    organizationId: organization.id,
    organizationName: organization.name,
  });

  return organization.id;
}

/**
 * Convert intake to a case
 */
export async function convertIntakeToCase(intakeId: string, professionalId: string): Promise<any> {
  try {
    // Fetch intake with service
    const intake = await prisma.caseIntake.findUnique({
      where: { id: intakeId },
      include: {
        service: true,
      },
    });

    if (!intake) {
      throw new Error('Intake not found');
    }

    // Map urgency to priority
    const urgencyMap: Record<string, string> = {
      emergency: 'urgent',
      urgent: 'high',
      soon: 'normal',
      normal: 'low',
    };
    const priority = urgencyMap[intake.urgencyLevel] || 'normal';

    // Ensure professional has an organization FIRST (we need the orgId for the applicant)
    const organizationId = await ensurePersonalOrganization(professionalId);

    // Find or create applicant user
    let applicantId: string;
    let isNewClient = false;
    let clientResetToken: string | null = null;

    const existingUser = await prisma.user.findUnique({
      where: { email: intake.applicantEmail },
    });

    if (existingUser) {
      applicantId = existingUser.id;
      // If existing user has no org, link them to this professional's org so they can access portal APIs
      if (!existingUser.organizationId) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { organizationId },
        });
      }
    } else {
      // Create new applicant user — linked to professional's org so portal APIs work
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const newUser = await prisma.user.create({
        data: {
          email: intake.applicantEmail,
          fullName: intake.applicantName,
          passwordHash: randomPassword,
          role: 'applicant',
          isActive: true,
          organizationId, // ← linked to professional's org
        },
      });
      applicantId = newUser.id;
      isNewClient = true;

      // Generate a 48-hour password-setup token so they can log in
      const crypto = await import('crypto');
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      await prisma.passwordResetToken.upsert({
        where: { userId: newUser.id },
        update: {
          token: hashedToken,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          used: false,
        },
        create: {
          userId: newUser.id,
          token: hashedToken,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });

      clientResetToken = rawToken; // raw token goes in the email link
    }

    // Generate case reference
    const referenceNumber = await generateCaseReference();

    // Create case
    const newCase = await prisma.case.create({
      data: {
        organizationId: organizationId,
        assignedProfessionalId: professionalId,
        applicantId: applicantId,
        referenceNumber,
        title: `${intake.service.name} — ${intake.applicantName}`,
        visaType: intake.service.caseType,
        originCountry: intake.applicantCountry,
        destinationCountry: intake.destinationCountry,
        priority,
        notes: intake.description,
        status: 'open',
      },
    });

    // Update intake status
    await prisma.caseIntake.update({
      where: { id: intakeId },
      data: {
        status: 'converted',
        convertedCaseId: newCase.id,
      },
    });

    // ── Auto-generate smart checklist from risk profile ──────────────────────
    // Read the risk profile that was built at intake submission time.
    // Collect all checklistHints from flagged factors and create a DocumentChecklist.
    try {
      const additionalData = (intake as any).additionalData as Record<string, any> | null;
      const riskProfile = additionalData?.riskProfile as {
        factors?: Array<{
          label: string;
          riskLevel: string;
          checklistHints?: string[];
          toolLabel?: string;
        }>;
        overallRisk?: string;
      } | null;

      if (riskProfile?.factors && riskProfile.factors.length > 0) {
        // Collect all hints from high/medium risk factors
        const allHints: { name: string; isRequired: boolean; source: string }[] = [];

        for (const factor of riskProfile.factors) {
          if (factor.riskLevel === 'high' || factor.riskLevel === 'medium') {
            for (const hint of factor.checklistHints || []) {
              allHints.push({
                name: hint,
                isRequired: factor.riskLevel === 'high',
                source: factor.label,
              });
            }
          }
        }

        // Always add core documents regardless of risk
        const coreItems = [
          { name: 'Valid passport (all pages — biographic + stamps)', isRequired: true },
          { name: 'Completed visa application form', isRequired: true },
          { name: 'Recent passport-size photographs (per destination requirements)', isRequired: true },
          { name: 'Proof of travel insurance (if required by destination)', isRequired: false },
        ];

        if (allHints.length > 0 || coreItems.length > 0) {
          // Create the checklist
          const checklist = await prisma.documentChecklist.create({
            data: {
              caseId: newCase.id,
              organizationId,
              name: `Smart Checklist — ${intake.service.name} (${intake.destinationCountry})`,
              visaType: intake.service.caseType,
              originCountry: intake.applicantCountry,
              destinationCountry: intake.destinationCountry,
            },
          });

          // Add core items first
          for (const item of coreItems) {
            await prisma.checklistItem.create({
              data: {
                checklistId: checklist.id,
                name: item.name,
                description: 'Standard document required for all applications.',
                isRequired: item.isRequired,
              },
            });
          }

          // Add risk-profile-derived items (deduplicated)
          const seen = new Set<string>();
          for (const hint of allHints) {
            const key = hint.name.toLowerCase().trim();
            if (seen.has(key)) continue;
            seen.add(key);
            await prisma.checklistItem.create({
              data: {
                checklistId: checklist.id,
                name: hint.name,
                description: `Flagged by AI risk assessment — ${hint.source}`,
                isRequired: hint.isRequired,
              },
            });
          }

          logger.info('Smart checklist created from risk profile', {
            caseId: newCase.id,
            checklistId: checklist.id,
            itemCount: coreItems.length + allHints.length,
          });
        }
      }
    } catch (checklistError: any) {
      // Non-blocking — don't fail the case creation if checklist generation fails
      logger.error('Failed to auto-generate checklist from risk profile', {
        error: checklistError.message,
        caseId: newCase.id,
      });
    }

    // Return case + metadata about whether a new client was created
    return {
      ...newCase,
      _isNewClient: isNewClient,
      _clientEmail: intake.applicantEmail,
      _clientName: intake.applicantName,
      _clientResetToken: clientResetToken,
    };
  } catch (error: any) {
    logger.error('Error converting intake to case', {
      error: error.message,
      intakeId,
      professionalId,
    });
    throw error;
  }
}
