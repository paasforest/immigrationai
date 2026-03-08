import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import { getNetworkDirectory, getNetworkProfile } from '../controllers/networkController';
import {
  createReferral,
  getMyReferrals,
  acceptReferral,
  declineReferral,
} from '../controllers/referralController';

const router = Router();

router.use(auth);
router.use(organizationContext);

router.get('/', getNetworkDirectory);
router.get('/:userId', getNetworkProfile);

export default router;
