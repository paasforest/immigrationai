import { Router } from 'express';
import { auth } from '../middleware/auth';
import { organizationContext } from '../middleware/organizationContext';
import {
  uploadDocument,
  getDocumentsByCase,
  updateDocument,
  deleteDocument,
  getDocumentDownload,
  getAllDocumentsByOrg,
  uploadMiddleware,
} from '../controllers/documentController';

const router = Router();

// All document routes require authentication and organization context
router.use(auth);
router.use(organizationContext);

// Document routes
router.get('/', getAllDocumentsByOrg); // GET /api/case-documents (all org documents)
router.post('/upload', uploadMiddleware.single('file'), uploadDocument); // POST /api/case-documents/upload
router.get('/case/:caseId', getDocumentsByCase); // GET /api/case-documents/case/:caseId
router.put('/:id', updateDocument); // PUT /api/case-documents/:id
router.delete('/:id', deleteDocument); // DELETE /api/case-documents/:id
router.get('/:id/download', getDocumentDownload); // GET /api/case-documents/:id/download

export default router;
