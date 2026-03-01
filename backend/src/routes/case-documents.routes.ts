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
  toggleEmbassyPackage,
  verifyDocument,
  sendEmbassyPackage,
  getEmbassyPackage,
  downloadEmbassyPackageZip,
} from '../controllers/documentController';
import {
  generateCaseDocument,
  getCaseDocumentChecklist,
  getCaseDocuments,
  generateCaseEligibilityReport,
} from '../controllers/caseDocumentsController';

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

// Embassy package routes
router.patch('/:id/embassy-package', toggleEmbassyPackage);         // toggle isEmbassyPackage on a document
router.patch('/:id/verify', verifyDocument);                         // mark client doc as verified
router.post('/case/:caseId/send-embassy-package', sendEmbassyPackage); // notify client package is ready
router.get('/case/:caseId/embassy-package', getEmbassyPackage);      // get all embassy docs (pro + client)
router.get('/case/:caseId/embassy-package/zip', downloadEmbassyPackageZip); // download all as ZIP

// Case document generation routes
router.post('/case/:caseId/generate', generateCaseDocument); // POST /api/case-documents/case/:caseId/generate
router.get('/case/:caseId/checklist', getCaseDocumentChecklist); // GET /api/case-documents/case/:caseId/checklist
router.get('/case/:caseId/all-documents', getCaseDocuments); // GET /api/case-documents/case/:caseId/all-documents
router.get('/case/:caseId/eligibility-report', generateCaseEligibilityReport); // GET /api/case-documents/case/:caseId/eligibility-report

export default router;
