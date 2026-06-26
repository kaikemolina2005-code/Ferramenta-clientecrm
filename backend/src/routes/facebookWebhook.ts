import express from 'express';
import {
  validateFacebookWebhook,
  handleFacebookWebhook,
  getFacebookStatus,
} from '../controllers/facebookWebhook.js';

const router = express.Router();

/**
 * GET  /api/facebook/webhook - Validação do webhook (Meta)
 * POST /api/facebook/webhook - Recebe novos leads do Facebook Lead Ads
 * GET  /api/facebook/status  - Verifica se as credenciais estão configuradas
 */
router.get('/webhook', validateFacebookWebhook);
router.post('/webhook', handleFacebookWebhook);
router.get('/status', getFacebookStatus);

export default router;
