import prisma from '../config/prisma';
import { logger } from '../utils/logger';
import { sendLeadNotificationEmail } from './emailService';
import { generateCaseReference } from '../utils/referenceNumber';
import bcrypt from 'bcryptjs';

interface MatchedProfessional {
  user: {
    id: string;
    email: string;
    organizationId: string | null;
    isActive: boolean;
    isIndependentProfessional: boolean;
    fullName: string | null;
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
          },
        },
      },
    });

    // Filter by active users
    const activeSpecs = specializations.filter((spec) => spec.user.isActive === true);

    // Apply corridor logic
    const corridorMatches = activeSpecs.filter((spec) => {
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
      // Count active assignments
      const activeAssignments = await prisma.intakeAssignment.count({
        where: {
          professionalId: spec.userId,
          status: {
            in: ['pending', 'accepted'],
          },
        },
      });

      // Filter out if at capacity
      if (activeAssignments >= spec.maxConcurrentLeads) {
        continue;
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

      matches.push({
        user: spec.user,
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

    // Find or create applicant user
    let applicantId: string;
    const existingUser = await prisma.user.findUnique({
      where: { email: intake.applicantEmail },
    });

    if (existingUser) {
      applicantId = existingUser.id;
    } else {
      // Create new applicant user
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const newUser = await prisma.user.create({
        data: {
          email: intake.applicantEmail,
          fullName: intake.applicantName,
          passwordHash: randomPassword,
          role: 'applicant',
          isActive: true,
          organizationId: null,
        },
      });
      applicantId = newUser.id;
    }

    // Fetch professional to get organizationId
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
      select: {
        organizationId: true,
      },
    });

    if (!professional || !professional.organizationId) {
      throw new Error('Professional not found or not in organization');
    }

    // Generate case reference
    const referenceNumber = await generateCaseReference();

    // Create case
    const newCase = await prisma.case.create({
      data: {
        organizationId: professional.organizationId,
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

    return newCase;
  } catch (error: any) {
    logger.error('Error converting intake to case', {
      error: error.message,
      intakeId,
      professionalId,
    });
    throw error;
  }
}
