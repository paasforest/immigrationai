import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  createReferral,
  getMyReferrals,
  acceptReferral,
  declineReferral,
} from '../controllers/referralController';

const router = Router();

router.use(auth);
router.use(organizationContext);

router.get('/', getMyReferrals);
router.post('/', createReferral);
router.post('/:id/accept', acceptReferral);
router.post('/:id/decline', declineReferral);

export default router;
