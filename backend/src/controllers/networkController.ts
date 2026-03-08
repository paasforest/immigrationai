import { Response } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types/request';
import { sendSuccess, sendError } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * GET /api/network — list professionals for the directory (auth + org).
 * Only verified, subscribed (org with active trial or paid) professionals.
 * Filters: search, professionalType, destinationCountries, availableForReferrals, availableForCoCounsel.
 */
export const getNetworkDirectory = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }

  const {
    search,
    professionalType,
    destinationCountry,
    availableForReferrals,
    availableForCoCounsel,
    page = '1',
    limit = '24',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Orgs that are active and (trial or paid)
  const orgWhere = {
    isActive: true,
    planStatus: { in: ['trial', 'active'] as string[] },
  };

  const profileWhere: any = {
    isVerified: true,
    user: {
      organizationId: { not: null },
      organization: orgWhere,
      isActive: true,
      role: { in: ['org_admin', 'professional'] },
    },
  };

  // Exclude current user
  profileWhere.userId = { not: req.user.userId };

  if (professionalType && typeof professionalType === 'string') {
    profileWhere.professionalType = professionalType;
  }
  if (availableForReferrals === 'true') {
    profileWhere.availableForReferrals = true;
  }
  if (availableForCoCounsel === 'true') {
    profileWhere.availableForCoCounsel = true;
  }

  const profiles = await prisma.professionalProfile.findMany({
    where: profileWhere,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
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
    orderBy: { displayName: 'asc' },
  });

  const userIds = profiles.map((p) => p.userId);
  const specializations = await prisma.professionalSpecialization.findMany({
    where: { userId: { in: userIds } },
    include: {
      service: { select: { id: true, name: true, caseType: true } },
    },
  });

  let filtered = profiles;

  if (search && typeof search === 'string' && search.trim()) {
    const q = (search as string).toLowerCase().trim();
    filtered = profiles.filter((p) => {
      const name = (p.displayName || (p.user as any)?.fullName || '').toLowerCase();
      const orgName = ((p.organization as any)?.name || '').toLowerCase();
      return name.includes(q) || orgName.includes(q);
    });
  }

  if (destinationCountry && typeof destinationCountry === 'string') {
    filtered = filtered.filter((p) => {
      const specs = specializations.filter((s) => s.userId === p.userId);
      return specs.some((s) =>
        s.destinationCorridors.length === 0 || s.destinationCorridors.includes(destinationCountry)
      );
    });
  }

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limitNum);

  const enriched = paginated.map((profile) => {
    const specs = specializations.filter((s) => s.userId === profile.userId);
    const destinations = new Set<string>();
    const services: string[] = [];
    specs.forEach((s) => {
      s.destinationCorridors.forEach((d) => destinations.add(d));
      if (s.service?.name) services.push(s.service.name);
    });
    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      title: profile.title,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      languages: profile.languages,
      isVerified: profile.isVerified,
      professionalType: profile.professionalType,
      availableForReferrals: profile.availableForReferrals,
      availableForCoCounsel: profile.availableForCoCounsel,
      locationCity: profile.locationCity,
      locationCountry: profile.locationCountry,
      websiteUrl: profile.websiteUrl,
      organization: profile.organization,
      destinationCountries: Array.from(destinations),
      visaTypes: [...new Set(services)].slice(0, 5),
    };
  });

  return sendSuccess(
    res,
    {
      profiles: enriched,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    },
    'Network directory retrieved'
  );
});

/**
 * GET /api/network/:userId — get one professional's profile for network view (auth).
 */
export const getNetworkProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }

  const { userId } = req.params;
  if (!userId) {
    return sendError(res, 'VALIDATION_ERROR', 'userId required', 400);
  }

  const profile = await prisma.professionalProfile.findFirst({
    where: {
      userId,
      isVerified: true,
      user: {
        organizationId: { not: null },
        organization: {
          isActive: true,
          planStatus: { in: ['trial', 'active'] },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          createdAt: true,
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

  if (!profile) {
    return sendError(res, 'NOT_FOUND', 'Profile not found or not in network', 404);
  }

  const specs = await prisma.professionalSpecialization.findMany({
    where: { userId: profile.userId },
    include: {
      service: { select: { id: true, name: true, caseType: true } },
    },
  });

  const destinations = new Set<string>();
  const visaTypes: string[] = [];
  specs.forEach((s) => {
    s.destinationCorridors.forEach((d) => destinations.add(d));
    if (s.service?.name) visaTypes.push(s.service.name);
  });

  return sendSuccess(
    res,
    {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      title: profile.title,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      languages: profile.languages,
      isVerified: profile.isVerified,
      professionalType: profile.professionalType,
      availableForReferrals: profile.availableForReferrals,
      availableForCoCounsel: profile.availableForCoCounsel,
      locationCity: profile.locationCity,
      locationCountry: profile.locationCountry,
      websiteUrl: profile.websiteUrl,
      organization: profile.organization,
      user: profile.user,
      destinationCountries: Array.from(destinations),
      visaTypes: [...new Set(visaTypes)],
    },
    'Profile retrieved'
  );
});
