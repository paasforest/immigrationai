import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext, organizationContextAllowExpired } from '../middleware/organizationContext';
import {
  createTask,
  getTasksByCase,
  updateTask,
  deleteTask,
  getUpcomingDeadlines,
  getAllTasksByOrg,
} from '../controllers/taskController';

const router = Router();

router.use(auth);

// Read-only — allow expired trial so dashboard (upcoming deadlines) doesn't 402
router.get('/', organizationContextAllowExpired, getAllTasksByOrg);
router.get('/case/:caseId', organizationContextAllowExpired, getTasksByCase);
router.get('/upcoming', organizationContextAllowExpired, getUpcomingDeadlines);

// Write — require active trial
router.post('/', organizationContext, createTask);
router.put('/:id', organizationContext, updateTask);
router.delete('/:id', organizationContext, deleteTask);

export default router;
