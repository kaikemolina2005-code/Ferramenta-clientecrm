// Document routes and AI processing
import { Router } from 'express';
import * as documentsController from '../controllers/documents.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Middleware - All routes require authentication
router.use(authMiddleware);

// POST /documents/lead/:leadId - Upload document
router.post(
  '/lead/:leadId',
  documentsController.upload.single('file'),
  documentsController.uploadDocument
);

// GET /documents/lead/:leadId - List lead documents
router.get('/lead/:leadId', documentsController.getLeadDocuments);

// DELETE /documents/:documentId - Delete document
router.delete('/:documentId', documentsController.deleteDocument);

// GET /documents/:documentId/download - Download document
router.get('/:documentId/download', documentsController.downloadDocument);

// PATCH /documents/:documentId/process - Mark document as processed
router.patch('/:documentId/process', documentsController.processDocument);

export default router;
