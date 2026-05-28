import { Router } from 'express';
import {
  receiveFormWebhook,
  receiveFormWebhookBatch,
  testWebhook,
} from '../controllers/webhooks.js';

const router = Router();

/**
 * POST /api/webhooks/forms
 * Receber um formulário e criar um lead automaticamente
 */
router.post('/forms', receiveFormWebhook);

/**
 * POST /api/webhooks/forms/batch
 * Receber múltiplos formulários (batch)
 */
router.post('/forms/batch', receiveFormWebhookBatch);

/**
 * GET /api/webhooks/forms/test
 * Testar se webhook está funcionando
 */
router.get('/forms/test', testWebhook);

export default router;
