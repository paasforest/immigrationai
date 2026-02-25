import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  getVACCentres,
  getWaitTimes,
  getBookingLinks,
} from '../controllers/vacController';

const router = Router();

// All VAC routes require authentication and organization context
router.use(auth);
router.use(organizationContext);

// VAC routes
router.get('/centres', getVACCentres); // GET /api/vac/centres
router.get('/wait-times', getWaitTimes); // GET /api/vac/wait-times
router.get('/booking-links', getBookingLinks); // GET /api/vac/booking-links

export default router;
