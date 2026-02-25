import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  uploadDocument,
  getDocumentsByCase,
  updateDocument,
  deleteDocument,
  getDocumentDownload,
  uploadMiddleware,
} from '../controllers/documentController';

const router = Router();

// All document routes require authentication and organization context
router.use(auth);
router.use(organizationContext);

// Document routes
router.post('/upload', uploadMiddleware.single('file'), uploadDocument); // POST /api/documents/upload
router.get('/case/:caseId', getDocumentsByCase); // GET /api/documents/case/:caseId
router.put('/:id', updateDocument); // PUT /api/documents/:id
router.delete('/:id', deleteDocument); // DELETE /api/documents/:id
router.get('/:id/download', getDocumentDownload); // GET /api/documents/:id/download

export default router;
