import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  createChecklist,
  getChecklistsByCase,
  updateChecklistItem,
  deleteChecklist,
} from '../controllers/checklistController';

const router = Router();

// All checklist routes require authentication and organization context
router.use(auth);
router.use(organizationContext);

// Checklist routes
router.post('/', createChecklist); // POST /api/checklists
router.get('/case/:caseId', getChecklistsByCase); // GET /api/checklists/case/:caseId
router.put('/items/:id', updateChecklistItem); // PUT /api/checklists/items/:id
router.delete('/:id', deleteChecklist); // DELETE /api/checklists/:id

export default router;


