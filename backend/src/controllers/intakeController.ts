import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import {
  assignIntake,
  reassignIntake,
  convertIntakeToCase,
} from '../services/routingEngine';
import {
  sendApplicantConfirmationEmail,
  sendProfessionalContactEmail,
} from '../services/emailService';
import { eligibilityService, type EligibilityInput } from '../services/eligibilityService';

// Module-level cache for services
const servicesCache: { data: any[] | null; cachedAt: number } = {
  data: null,
  cachedAt: 0,
};

/**
 * Submit intake (PUBLIC - no auth)
 */
export async function submitIntake(req: Request, res: Response): Promise<void> {
  try {
    const {
      serviceId,
      applicantName,
      applicantEmail,
      applicantPhone,
      applicantCountry,
      destinationCountry,
      urgencyLevel = 'normal',
      description,
      additionalData,
    } = req.body;

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!serviceId) errors.serviceId = 'Service is required';
    if (!applicantName || applicantName.trim().length < 2)
      errors.applicantName = 'Name must be at least 2 characters';
    if (!applicantEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail))
      errors.applicantEmail = 'Valid email is required';
    if (!applicantCountry) errors.applicantCountry = 'Current country is required';
    if (!destinationCountry) errors.destinationCountry = 'Destination country is required';
    if (!description || description.trim().length < 20)
      errors.description = 'Description must be at least 20 characters';

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors,
      });
      return;
    }

    // Validate service exists and is active
    const service = await prisma.serviceCatalog.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      throw new AppError('Service not found or inactive', 404);
    }

    // Generate unique reference number
    let referenceNumber: string;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      referenceNumber = `INT-${year}-${randomNum}`;

      const existing = await prisma.caseIntake.findUnique({
        where: { referenceNumber },
        select: { id: true },
      });

      if (!existing) {
        break;
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new AppError('Failed to generate unique reference number', 500);
    }

    // Create intake
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const intake = await prisma.caseIntake.create({
      data: {
        referenceNumber: referenceNumber!,
        serviceId,
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.toLowerCase().trim(),
        applicantPhone: applicantPhone?.trim() || null,
        applicantCountry,
        destinationCountry,
        urgencyLevel,
        description: description.trim(),
        additionalData: additionalData || null,
        ipAddress: req.ip || null,
        expiresAt,
        status: 'pending_assignment',
      },
      include: {
        service: true,
      },
    });

    // Run silent eligibility assessment (non-blocking)
    setImmediate(async () => {
      try {
        // Map destination country to visa type codes
        const countryToVisaType: Record<string, string> = {
          'United Kingdom': 'uk_skilled_worker',
          'Canada': 'canada_express_entry',
          'United States': 'usa_h1b',
          'Germany': 'germany_blue_card',
          'UAE': 'uae_employment',
          'Australia': 'australia_skilled',
          'Netherlands': 'netherlands_work_permit',
          'Ireland': 'ireland_critical_skills',
        };

        const eligibilityInput: EligibilityInput = {
          email: applicantEmail,
          country: applicantCountry.toLowerCase().replace(/\s+/g, '_'),
          visaType: countryToVisaType[destinationCountry] || 'uk_skilled_worker',
          notes: description,
          ipAddress: req.ip || undefined,
        };

        const eligibilityResult = await eligibilityService.assessEligibility(eligibilityInput);
        
        // Store eligibility result with the intake
        await prisma.caseIntake.update({
          where: { id: intake.id },
          data: {
            additionalData: {
              ...additionalData,
              eligibilityAssessment: {
                verdict: eligibilityResult.verdict,
                confidence: eligibilityResult.confidence,
                summary: eligibilityResult.summary,
                riskFactors: eligibilityResult.riskFactors,
                recommendedDocuments: eligibilityResult.recommendedDocuments,
                recommendedSteps: eligibilityResult.recommendedSteps,
                assessedAt: new Date().toISOString(),
              },
            },
          },
        });

        logger.info('Eligibility assessment completed', {
          intakeId: intake.id,
          verdict: eligibilityResult.verdict,
          confidence: eligibilityResult.confidence,
        });
      } catch (error: any) {
        logger.error('Eligibility assessment failed', {
          error: error.message || error,
          intakeId: intake.id,
        });
        // Don't fail the intake if assessment fails
      }
    });

    // Use setImmediate for routing and email (non-blocking)
    setImmediate(async () => {
      try {
        await assignIntake(intake.id);
      } catch (error: any) {
        logger.error('Routing failed', {
          error: error.message || error,
          intakeId: intake.id,
        });
      }
    });

    setImmediate(async () => {
      try {
        await sendApplicantConfirmationEmail({
          toEmail: intake.applicantEmail,
          applicantName: intake.applicantName,
          referenceNumber: intake.referenceNumber,
          serviceName: intake.service.name,
          statusUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/intake-status?ref=${intake.referenceNumber}`,
        });
      } catch (error: any) {
        logger.error('Confirmation email failed', {
          error: error.message || error,
          intakeId: intake.id,
        });
      }
    });

    res.status(201).json({
      success: true,
      data: {
        referenceNumber: intake.referenceNumber,
        id: intake.id,
      },
      message: 'Request received. A specialist will contact you within 24-48 hours.',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to submit intake', 500);
  }
}

/**
 * Get services (PUBLIC - no auth)
 */
export async function getServices(req: Request, res: Response): Promise<void> {
  try {
    // Check cache (1 hour TTL)
    const now = Date.now();
    if (servicesCache.data && now - servicesCache.cachedAt < 3600000) {
      res.json({
        success: true,
        data: servicesCache.data,
        message: 'Services retrieved successfully',
      });
      return;
    }

    // Fetch from database
    const services = await prisma.serviceCatalog.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        longDescription: true,
        caseType: true,
        icon: true,
        estimatedTimeline: true,
        startingPrice: true,
        sortOrder: true,
      },
    });

    // Update cache
    servicesCache.data = services;
    servicesCache.cachedAt = now;

    res.json({
      success: true,
      data: services,
      message: 'Services retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve services', 500);
  }
}

/**
 * Get intake status (PUBLIC - no auth)
 */
export async function getIntakeStatus(req: Request, res: Response): Promise<void> {
  try {
    const { ref } = req.params;
    const { email } = req.query;

    if (!ref || !email) {
      throw new AppError('Reference number and email are required', 400);
    }

    const intake = await prisma.caseIntake.findUnique({
      where: { referenceNumber: ref },
      include: {
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!intake) {
      throw new AppError('Reference not found', 404);
    }

    // Verify email matches
    if (intake.applicantEmail.toLowerCase() !== (email as string).toLowerCase()) {
      throw new AppError('Reference not found', 404);
    }

    // Build response based on status
    const response: any = {
      status: intake.status,
      referenceNumber: intake.referenceNumber,
      serviceName: intake.service.name,
      submittedAt: intake.submittedAt,
    };

    if (intake.status === 'converted' && intake.convertedCaseId) {
      // Fetch case reference
      const caseData = await prisma.case.findUnique({
        where: { id: intake.convertedCaseId },
        select: {
          referenceNumber: true,
        },
      });
      response.caseReference = caseData?.referenceNumber;
    }

    if (intake.status === 'assigned') {
      // Get latest assignment
      const assignment = await prisma.intakeAssignment.findFirst({
        where: {
          intakeId: intake.id,
          status: 'pending',
        },
        orderBy: {
          assignedAt: 'desc',
        },
        select: {
          expiresAt: true,
        },
      });
      if (assignment) {
        response.expiresAt = assignment.expiresAt;
      }
    }

    res.json({
      success: true,
      data: response,
      message: 'Status retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve status', 500);
  }
}

/**
 * Get my leads (PROTECTED)
 */
export async function getMyLeads(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const professionalId = user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      professionalId,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const [assignments, total] = await Promise.all([
      prisma.intakeAssignment.findMany({
        where,
        include: {
          intake: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  caseType: true,
                },
              },
            },
          },
        },
        orderBy: {
          assignedAt: 'desc',
        },
        skip,
        take,
      }),
      prisma.intakeAssignment.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      message: 'Leads retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve leads', 500);
  }
}

/**
 * Respond to lead (PROTECTED)
 */
export async function respondToLead(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { assignmentId, action, declinedReason } = req.body;

    if (!assignmentId || !action) {
      throw new AppError('Assignment ID and action are required', 400);
    }

    if (action !== 'accept' && action !== 'decline') {
      throw new AppError('Action must be accept or decline', 400);
    }

    // Fetch assignment with intake
    const assignment = await prisma.intakeAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        intake: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    // Verify ownership
    if (assignment.professionalId !== user.id) {
      throw new AppError('Access denied', 403);
    }

    // Verify status
    if (assignment.status !== 'pending') {
      throw new AppError('Assignment is not pending', 400);
    }

    // Verify not expired
    if (new Date(assignment.expiresAt) < new Date()) {
      throw new AppError('Assignment expired', 400);
    }

    if (action === 'accept') {
      // Convert to case
      const newCase = await convertIntakeToCase(
        assignment.intakeId,
        user.id
      );

      // Update assignment
      await prisma.intakeAssignment.update({
        where: { id: assignmentId },
        data: {
          status: 'accepted',
          respondedAt: new Date(),
        },
      });

      // Send professional contact email (non-blocking)
      setImmediate(async () => {
        try {
          const professional = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          });

          const profile = await prisma.professionalProfile.findUnique({
            where: { userId: user.id },
            select: {
              title: true,
            },
          });

          if (professional) {
            await sendProfessionalContactEmail({
              toEmail: assignment.intake.applicantEmail,
              applicantName: assignment.intake.applicantName,
              professionalName: professional.fullName || professional.email.split('@')[0],
              professionalTitle: profile?.title || undefined,
              professionalEmail: professional.email,
              professionalPhone: professional.phone || undefined,
              serviceName: assignment.intake.service.name,
              caseReference: newCase.referenceNumber,
            });
          }
        } catch (emailError: any) {
          logger.error('Professional contact email failed', {
            error: emailError.message || emailError,
            assignmentId,
          });
        }
      });

      res.json({
        success: true,
        data: {
          case: newCase,
        },
        message: 'Lead accepted. Case created.',
      });
    } else {
      // Decline
      if (!declinedReason || declinedReason.trim().length < 5) {
        throw new AppError('Decline reason is required (minimum 5 characters)', 400);
      }

      // Update assignment
      await prisma.intakeAssignment.update({
        where: { id: assignmentId },
        data: {
          status: 'declined',
          respondedAt: new Date(),
          declinedReason: declinedReason.trim(),
        },
      });

      // Reassign (non-blocking)
      setImmediate(async () => {
        try {
          await reassignIntake(assignment.intakeId);
        } catch (error: any) {
          logger.error('Reassignment failed', {
            error: error.message || error,
            intakeId: assignment.intakeId,
          });
        }
      });

      res.json({
        success: true,
        message: 'Lead declined. Finding next specialist.',
      });
    }
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to respond to lead', 500);
  }
}

/**
 * Get my specializations (PROTECTED)
 */
export async function getMySpecializations(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    const specializations = await prisma.professionalSpecialization.findMany({
      where: {
        userId: user.id,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            caseType: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: specializations,
      message: 'Specializations retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve specializations', 500);
  }
}

/**
 * Upsert specialization (PROTECTED)
 */
export async function upsertSpecialization(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const {
      serviceId,
      originCorridors = [],
      destinationCorridors = [],
      maxConcurrentLeads = 10,
      isAcceptingLeads = true,
      yearsExperience,
      bio,
    } = req.body;

    if (!serviceId) {
      throw new AppError('Service ID is required', 400);
    }

    // Validate service exists
    const service = await prisma.serviceCatalog.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Upsert specialization
    const specialization = await prisma.professionalSpecialization.upsert({
      where: {
        userId_serviceId: {
          userId: user.id,
          serviceId,
        },
      },
      update: {
        originCorridors,
        destinationCorridors,
        maxConcurrentLeads,
        isAcceptingLeads,
        yearsExperience: yearsExperience || null,
        bio: bio || null,
      },
      create: {
        userId: user.id,
        organizationId: user.organizationId || null,
        serviceId,
        originCorridors,
        destinationCorridors,
        maxConcurrentLeads,
        isAcceptingLeads,
        yearsExperience: yearsExperience || null,
        bio: bio || null,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            caseType: true,
            icon: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: specialization,
      message: 'Specialization saved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to save specialization', 500);
  }
}

/**
 * Delete specialization (PROTECTED)
 */
export async function deleteSpecialization(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    // Fetch specialization
    const specialization = await prisma.professionalSpecialization.findUnique({
      where: { id },
    });

    if (!specialization) {
      throw new AppError('Specialization not found', 404);
    }

    // Verify ownership
    if (specialization.userId !== user.id) {
      throw new AppError('Access denied', 403);
    }

    // Check for pending assignments
    const pendingAssignments = await prisma.intakeAssignment.count({
      where: {
        professionalId: user.id,
        status: 'pending',
        intake: {
          serviceId: specialization.serviceId,
        },
      },
    });

    if (pendingAssignments > 0) {
      throw new AppError(
        'Cannot delete specialization with pending leads. Please respond to all pending leads first.',
        400
      );
    }

    // Delete
    await prisma.professionalSpecialization.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Specialization deleted successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to delete specialization', 500);
  }
}

/**
 * Upsert public profile (PROTECTED)
 */
export async function upsertPublicProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const {
      displayName,
      title,
      bio,
      avatarUrl,
      languages = [],
      isPublic = false,
      locationCity,
      locationCountry,
      linkedinUrl,
      websiteUrl,
    } = req.body;

    if (!displayName || displayName.trim().length < 2) {
      throw new AppError('Display name is required (minimum 2 characters)', 400);
    }

    const profile = await prisma.professionalProfile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        organizationId: user.organizationId || null,
        displayName: displayName.trim(),
        title: title?.trim() || null,
        bio: bio?.trim() || null,
        avatarUrl: avatarUrl || null,
        languages,
        isPublic,
        locationCity: locationCity?.trim() || null,
        locationCountry: locationCountry?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
      },
      create: {
        userId: user.id,
        organizationId: user.organizationId || null,
        displayName: displayName.trim(),
        title: title?.trim() || null,
        bio: bio?.trim() || null,
        avatarUrl: avatarUrl || null,
        languages,
        isPublic,
        locationCity: locationCity?.trim() || null,
        locationCountry: locationCountry?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
      },
    });

    res.json({
      success: true,
      data: profile,
      message: 'Profile saved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to save profile', 500);
  }
}

/**
 * Get my profile (PROTECTED)
 */
export async function getMyProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    const profile = await prisma.professionalProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    res.json({
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(error.message || 'Failed to retrieve profile', 500);
  }
}

/**
 * Get public directory (PUBLIC - no auth)
 */
export async function getPublicDirectory(req: Request, res: Response): Promise<void> {
  try {
    const {
      service: serviceCaseType,
      originCountry,
      destinationCountry,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // First, get all public profiles
    const allProfiles = await prisma.professionalProfile.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            organizationId: true,
          },
        },
        organization: {
          select: {
            name: true,
            country: true,
          },
        },
      },
    });

    // Get all specializations for all public profile users
    const userIds = allProfiles.map((p) => p.userId);
    const allSpecializations = await prisma.professionalSpecialization.findMany({
      where: {
        userId: { in: userIds },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            caseType: true,
            slug: true,
          },
        },
      },
    });

    // Filter profiles based on criteria
    let filteredProfiles = allProfiles;

    // Filter by service type if provided
    if (serviceCaseType) {
      const service = await prisma.serviceCatalog.findFirst({
        where: { caseType: serviceCaseType as string },
      });
      if (service) {
        filteredProfiles = filteredProfiles.filter((profile) => {
          const userSpecs = allSpecializations.filter((s) => s.userId === profile.userId);
          return userSpecs.some(
            (s) => s.serviceId === service.id && s.isAcceptingLeads === true
          );
        });
      }
    }

    // Filter by origin country if provided
    if (originCountry) {
      filteredProfiles = filteredProfiles.filter((profile) => {
        const userSpecs = allSpecializations.filter((s) => s.userId === profile.userId);
        return userSpecs.some((s) => {
          if (s.originCorridors.length === 0) return true; // Accepts any
          return s.originCorridors.includes(originCountry as string);
        });
      });
    }

    // Filter by destination country if provided
    if (destinationCountry) {
      filteredProfiles = filteredProfiles.filter((profile) => {
        const userSpecs = allSpecializations.filter((s) => s.userId === profile.userId);
        return userSpecs.some((s) => {
          if (s.destinationCorridors.length === 0) return true; // Accepts any
          return s.destinationCorridors.includes(destinationCountry as string);
        });
      });
    }

    // Get total count before pagination
    const total = filteredProfiles.length;

    // Apply pagination
    const paginatedProfiles = filteredProfiles.slice(skip, skip + limitNum);

    // Calculate profile data
    const enrichedProfiles = paginatedProfiles.map((profile) => {
      const userSpecs = allSpecializations.filter((s) => s.userId === profile.userId);
      const services = userSpecs.map((s) => s.service.name);
      const corridors = new Set<string>();
      userSpecs.forEach((s) => {
        s.destinationCorridors.forEach((dest) => corridors.add(dest));
      });
      const isAcceptingLeads = userSpecs.some((s) => s.isAcceptingLeads === true);

      return {
        id: profile.id,
        userId: profile.userId,
        displayName: profile.displayName,
        title: profile.title,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        languages: profile.languages,
        isVerified: profile.isVerified,
        isAcceptingLeads,
        locationCity: profile.locationCity,
        locationCountry: profile.locationCountry,
        linkedinUrl: profile.linkedinUrl,
        websiteUrl: profile.websiteUrl,
        services,
        corridors: Array.from(corridors),
        organization: profile.organization,
      };
    });

    res.json({
      success: true,
      data: {
        profiles: enrichedProfiles,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    logger.error('Failed to get public directory', { error: error.message });
    throw new AppError(error.message || 'Failed to get directory', 500);
  }
}

/**
 * Get public profile by userId (PUBLIC - no auth)
 */
export async function getPublicProfile(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;

    const profile = await prisma.professionalProfile.findFirst({
      where: {
        userId,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Profile not found or not public', 404);
    }

    // Get specializations for this user
    const specializations = await prisma.professionalSpecialization.findMany({
      where: {
        userId: profile.userId,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            caseType: true,
            slug: true,
          },
        },
      },
    });

    // Calculate isAcceptingLeads
    const isAcceptingLeads = specializations.some((s) => s.isAcceptingLeads === true);

    // Return safe public fields only
    res.json({
      success: true,
      data: {
        id: profile.id,
        userId: profile.userId,
        displayName: profile.displayName,
        title: profile.title,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        languages: profile.languages,
        isVerified: profile.isVerified,
        isAcceptingLeads,
        locationCity: profile.locationCity,
        locationCountry: profile.locationCountry,
        linkedinUrl: profile.linkedinUrl,
        websiteUrl: profile.websiteUrl,
        specializations: specializations.map((s) => ({
          id: s.id,
          service: s.service,
          originCorridors: s.originCorridors,
          destinationCorridors: s.destinationCorridors,
          yearsExperience: s.yearsExperience,
          bio: s.bio,
        })),
      },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to get public profile', { error: error.message });
    throw new AppError(error.message || 'Failed to get profile', 500);
  }
}

/**
 * Get pending verifications (PROTECTED - admin only)
 */
export async function getPendingVerifications(req: Request, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const profiles = await prisma.professionalProfile.findMany({
      where: {
        verificationDoc: { not: null },
        isVerified: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take: limitNum,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.professionalProfile.count({
      where: {
        verificationDoc: { not: null },
        isVerified: false,
      },
    });

    res.json({
      success: true,
      data: {
        profiles,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    logger.error('Failed to get pending verifications', { error: error.message });
    throw new AppError(error.message || 'Failed to get verifications', 500);
  }
}

/**
 * Verify professional (PROTECTED - admin only)
 */
export async function verifyProfessional(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const { profileId, action, rejectionReason } = req.body;

    if (!profileId || !action || (action === 'reject' && !rejectionReason)) {
      throw new AppError('Missing required fields', 400);
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    if (action === 'approve') {
      await prisma.professionalProfile.update({
        where: { id: profileId },
        data: { isVerified: true },
      });

      // Send email
      try {
        const { sendVerificationApprovedEmail } = await import('../services/emailService');
        await sendVerificationApprovedEmail({
          toEmail: profile.user.email,
          professionalName: profile.user.fullName || profile.displayName,
        });
      } catch (emailError) {
        logger.error('Failed to send verification approval email', { emailError });
      }

      // Log to audit
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'professional_verified',
          resourceType: 'professional_profile',
          resourceId: profileId,
          metadata: {
            professionalId: profile.userId,
            professionalName: profile.displayName,
          },
        },
      });
    } else if (action === 'reject') {
      await prisma.professionalProfile.update({
        where: { id: profileId },
        data: {
          verificationDoc: null, // Clear so they can resubmit
        },
      });

      // Send email
      try {
        const { sendVerificationRejectedEmail } = await import('../services/emailService');
        await sendVerificationRejectedEmail({
          toEmail: profile.user.email,
          professionalName: profile.user.fullName || profile.displayName,
          rejectionReason: rejectionReason as string,
        });
      } catch (emailError) {
        logger.error('Failed to send verification rejection email', { emailError });
      }

      // Log to audit
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'professional_verification_rejected',
          resourceType: 'professional_profile',
          resourceId: profileId,
          metadata: {
            professionalId: profile.userId,
            professionalName: profile.displayName,
            rejectionReason,
          },
        },
      });
    }

    const updatedProfile = await prisma.professionalProfile.findUnique({
      where: { id: profileId },
    });

    res.json({
      success: true,
      data: updatedProfile,
      message: `Verification ${action === 'approve' ? 'approved' : 'rejected'}`,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Failed to verify professional', { error: error.message });
    throw new AppError(error.message || 'Failed to verify professional', 500);
  }
}

/**
 * Get all intakes (PROTECTED - admin only)
 */
export async function getAllIntakes(req: Request, res: Response): Promise<void> {
  try {
    const {
      status,
      serviceId,
      dateFrom,
      dateTo,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (serviceId) where.serviceId = serviceId;
    if (dateFrom || dateTo) {
      where.submittedAt = {};
      if (dateFrom) where.submittedAt.gte = new Date(dateFrom as string);
      if (dateTo) where.submittedAt.lte = new Date(dateTo as string);
    }

    const [intakes, total] = await Promise.all([
      prisma.caseIntake.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              caseType: true,
            },
          },
          assignments: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          submittedAt: 'desc',
        },
      }),
      prisma.caseIntake.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        intakes,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    logger.error('Failed to get all intakes', { error: error.message });
    throw new AppError(error.message || 'Failed to get intakes', 500);
  }
}

/**
 * Get routing stats (PROTECTED - admin only)
 */
export async function getRoutingStats(req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalIntakes,
      intakesThisMonth,
      successfullyMatched,
      noMatchFound,
      declinedAll,
      allAssignments,
      allIntakes,
      activeProfessionals,
    ] = await Promise.all([
      prisma.caseIntake.count(),
      prisma.caseIntake.count({
        where: {
          submittedAt: { gte: startOfMonth },
        },
      }),
      prisma.caseIntake.count({
        where: { status: 'converted' },
      }),
      prisma.caseIntake.count({
        where: { status: 'no_match_found' },
      }),
      prisma.caseIntake.count({
        where: { status: 'declined_all' },
      }),
      prisma.intakeAssignment.findMany({
        where: { status: 'accepted' },
        select: {
          attemptNumber: true,
          assignedAt: true,
          respondedAt: true,
        },
      }),
      prisma.caseIntake.findMany({
        include: {
          service: {
            select: {
              name: true,
              caseType: true,
            },
          },
        },
      }),
      prisma.professionalProfile.count({
        where: {
          isPublic: true,
          specializations: {
            some: {
              isAcceptingLeads: true,
            },
          },
        },
      }),
    ]);

    // Calculate average match attempts
    const avgMatchAttempts =
      allAssignments.length > 0
        ? allAssignments.reduce((sum, a) => sum + a.attemptNumber, 0) / allAssignments.length
        : 0;

    // Calculate average response hours
    const responseTimes = allAssignments
      .filter((a) => a.respondedAt)
      .map((a) => {
        const hours = (a.respondedAt!.getTime() - a.assignedAt.getTime()) / (1000 * 60 * 60);
        return hours;
      });
    const avgResponseHours =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : 0;

    // Top services
    const serviceCounts: Record<string, number> = {};
    allIntakes.forEach((intake) => {
      const serviceName = intake.service.name;
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Top corridors
    const corridorCounts: Record<string, number> = {};
    allIntakes.forEach((intake) => {
      const corridor = `${intake.applicantCountry} → ${intake.destinationCountry}`;
      corridorCounts[corridor] = (corridorCounts[corridor] || 0) + 1;
    });
    const topCorridors = Object.entries(corridorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([corridor, count]) => ({ corridor, count }));

    res.json({
      success: true,
      data: {
        totalIntakes,
        intakesThisMonth,
        successfullyMatched,
        noMatchFound,
        declinedAll,
        averageMatchAttempts: Math.round(avgMatchAttempts * 10) / 10,
        averageResponseHours: Math.round(avgResponseHours * 10) / 10,
        topServices,
        topCorridors,
        totalActiveProfessionals: activeProfessionals,
      },
    });
  } catch (error: any) {
    logger.error('Failed to get routing stats', { error: error.message });
    throw new AppError(error.message || 'Failed to get stats', 500);
  }
}

/**
 * Get my lead stats (PROTECTED)
 */
export async function getMyLeadStats(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;
    const professionalId = user.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [
      allAssignments,
      acceptedAssignments,
      declinedAssignments,
      expiredAssignments,
      thisMonthAssignments,
      thisMonthAccepted,
    ] = await Promise.all([
      prisma.intakeAssignment.findMany({
        where: { professionalId },
        include: {
          intake: {
            include: {
              service: {
                select: {
                  name: true,
                  caseType: true,
                },
              },
            },
          },
        },
      }),
      prisma.intakeAssignment.findMany({
        where: {
          professionalId,
          status: 'accepted',
        },
        select: {
          assignedAt: true,
          respondedAt: true,
        },
      }),
      prisma.intakeAssignment.findMany({
        where: {
          professionalId,
          status: 'declined',
        },
      }),
      prisma.intakeAssignment.findMany({
        where: {
          professionalId,
          status: 'pending',
          expiresAt: { lt: now },
        },
      }),
      prisma.intakeAssignment.findMany({
        where: {
          professionalId,
          assignedAt: { gte: startOfMonth },
        },
      }),
      prisma.intakeAssignment.findMany({
        where: {
          professionalId,
          status: 'accepted',
          assignedAt: { gte: startOfMonth },
        },
      }),
    ]);

    const totalLeadsReceived = allAssignments.length;
    const totalAccepted = acceptedAssignments.length;
    const totalDeclined = declinedAssignments.length;
    const totalExpired = expiredAssignments.length;
    const acceptanceRate =
      totalLeadsReceived > 0 ? Math.round((totalAccepted / totalLeadsReceived) * 100) : 0;

    // Average response hours
    const responseTimes = acceptedAssignments
      .filter((a) => a.respondedAt)
      .map((a) => {
        const hours = (a.respondedAt!.getTime() - a.assignedAt.getTime()) / (1000 * 60 * 60);
        return hours;
      });
    const avgResponseHours =
      responseTimes.length > 0
        ? Math.round((responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length) * 10) /
          10
        : 0;

    // Top service types
    const serviceCounts: Record<string, number> = {};
    allAssignments.forEach((a) => {
      const serviceName = a.intake.service.name;
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    });
    const topServiceTypes = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Top origin countries
    const originCounts: Record<string, number> = {};
    allAssignments.forEach((a) => {
      const country = a.intake.applicantCountry;
      originCounts[country] = (originCounts[country] || 0) + 1;
    });
    const topOriginCountries = Object.entries(originCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    // Top destinations
    const destCounts: Record<string, number> = {};
    allAssignments.forEach((a) => {
      const dest = a.intake.destinationCountry;
      destCounts[dest] = (destCounts[dest] || 0) + 1;
    });
    const topDestinations = Object.entries(destCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([destination, count]) => ({ destination, count }));

    // Leads by month (last 6 months)
    const leadsByMonth: Array<{ month: string; received: number; accepted: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const monthReceived = allAssignments.filter(
        (a) => a.assignedAt >= monthStart && a.assignedAt <= monthEnd
      ).length;
      const monthAccepted = acceptedAssignments.filter(
        (a) => a.assignedAt >= monthStart && a.assignedAt <= monthEnd
      ).length;

      leadsByMonth.push({
        month: monthName,
        received: monthReceived,
        accepted: monthAccepted,
      });
    }

    res.json({
      success: true,
      data: {
        totalLeadsReceived,
        totalAccepted,
        totalDeclined,
        totalExpired,
        acceptanceRate,
        leadsThisMonth: thisMonthAssignments.length,
        acceptedThisMonth: thisMonthAccepted.length,
        avgResponseHours,
        topServiceTypes,
        topOriginCountries,
        topDestinations,
        leadsByMonth,
      },
    });
  } catch (error: any) {
    logger.error('Failed to get lead stats', { error: error.message });
    throw new AppError(error.message || 'Failed to get stats', 500);
  }
}


/**
 * PATCH /api/intake/:id/eligibility-score
 * Silently attaches a background eligibility score to an intake lead.
 * Called from the frontend after form submission — no auth required.
 * The score is used for lead routing and pricing internally.
 */
export async function patchEligibilityScore(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { eligibilityScore } = req.body;

    if (typeof eligibilityScore !== 'number' || eligibilityScore < 0 || eligibilityScore > 100) {
      return res.status(400).json({ success: false, message: 'Invalid score' });
    }

    // Store score in additionalData JSON field — no schema migration needed
    const intake = await prisma.caseIntake.findUnique({ where: { id } });
    if (intake) {
      const existing = (intake.additionalData as Record<string, any>) || {};
      await prisma.caseIntake.update({
        where: { id },
        data: {
          additionalData: {
            ...existing,
            _eligibilityScore: eligibilityScore,
            _eligibilityScoredAt: new Date().toISOString(),
          },
        },
      });
    }

    return res.json({ success: true });
  } catch {
    // Best-effort — never surface errors to the applicant
    return res.json({ success: true });
  }
}
