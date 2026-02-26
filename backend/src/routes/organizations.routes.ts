import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createOrganization,
  getMyOrganization,
  updateMyOrganization,
  getOrganizationUsers,
  inviteUser,
  updateOrganizationUser,
  checkOnboardingStatus,
  completeOnboarding,
} from '../controllers/organizationController';

const router = Router();

// Create organization (during registration - no org context needed)
router.post('/', auth, asyncHandler(createOrganization));

// Get my organization (requires auth)
router.get('/me', auth, asyncHandler(getMyOrganization));

// Update my organization (requires auth + org context)
router.put('/me', auth, organizationContext, asyncHandler(updateMyOrganization));

// Get organization users (requires auth + org context)
router.get('/me/users', auth, organizationContext, asyncHandler(getOrganizationUsers));

// Invite user (requires auth + org context)
router.post('/me/invite', auth, organizationContext, asyncHandler(inviteUser));

// Update organization user (requires auth + org context)
router.put('/me/users/:userId', auth, organizationContext, asyncHandler(updateOrganizationUser));

// Onboarding routes (no org context needed)
router.get('/onboarding-status', auth, asyncHandler(checkOnboardingStatus));
router.post('/complete-onboarding', auth, asyncHandler(completeOnboarding));

export default router;
