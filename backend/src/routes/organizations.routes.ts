import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
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
router.post('/', auth, createOrganization);

// Get my organization (requires auth)
router.get('/me', auth, getMyOrganization);

// Update my organization (requires auth + org context)
router.put('/me', auth, organizationContext, updateMyOrganization);

// Get organization users (requires auth + org context)
router.get('/me/users', auth, organizationContext, getOrganizationUsers);

// Invite user (requires auth + org context)
router.post('/me/invite', auth, organizationContext, inviteUser);

// Update organization user (requires auth + org context)
router.put('/me/users/:userId', auth, organizationContext, updateOrganizationUser);

// Onboarding routes (no org context needed)
router.get('/onboarding-status', auth, checkOnboardingStatus);
router.post('/complete-onboarding', auth, completeOnboarding);

export default router;
