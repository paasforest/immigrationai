import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  createTask,
  getTasksByCase,
  updateTask,
  deleteTask,
  getUpcomingDeadlines,
  getAllTasksByOrg,
} from '../controllers/taskController';

const router = Router();

// All task routes require authentication and organization context
router.use(auth);
router.use(organizationContext);

// Task routes
router.get('/', getAllTasksByOrg); // GET /api/tasks (all org tasks)
router.post('/', createTask); // POST /api/tasks
router.get('/case/:caseId', getTasksByCase); // GET /api/tasks/case/:caseId
router.get('/upcoming', getUpcomingDeadlines); // GET /api/tasks/upcoming
router.put('/:id', updateTask); // PUT /api/tasks/:id
router.delete('/:id', deleteTask); // DELETE /api/tasks/:id

export default router;
