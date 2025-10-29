import { Router } from 'express';
import { checklistController } from '../controllers/checklistController';

const router = Router();

// Public routes (no authentication required for checklists)
router.get('/', checklistController.getChecklist);
router.get('/all', checklistController.getAllChecklists);

export default router;


