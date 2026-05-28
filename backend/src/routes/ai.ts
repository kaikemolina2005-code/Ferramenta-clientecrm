import { Router } from 'express';
import {
  analyzeDocument,
  extractData,
  summarizeDocument,
  fillFormFields,
  getAIStatus,
  processLeadDocuments,
} from '../controllers/ai';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * GET /api/ai/status
 * Verificar se IA está configurada
 */
router.get('/status', authMiddleware, getAIStatus);

/**
 * POST /api/ai/documents/:documentId/analyze
 * Analisar um documento com IA
 */
router.post('/documents/:documentId/analyze', authMiddleware, analyzeDocument);

/**
 * POST /api/ai/documents/:documentId/extract
 * Extrair dados estruturados de um documento
 */
router.post('/documents/:documentId/extract', authMiddleware, extractData);

/**
 * POST /api/ai/documents/:documentId/summarize
 * Gerar resumo de um documento
 */
router.post('/documents/:documentId/summarize', authMiddleware, summarizeDocument);

/**
 * POST /api/ai/leads/:leadId/fill-form/:documentId
 * Preencher formulário com dados do lead
 */
router.post('/leads/:leadId/fill-form/:documentId', authMiddleware, fillFormFields);

/**
 * POST /api/ai/leads/:leadId/process-all
 * Processar todos os documentos de um lead
 */
router.post('/leads/:leadId/process-all', authMiddleware, processLeadDocuments);

export default router;
