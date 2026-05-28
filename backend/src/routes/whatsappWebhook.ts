import express from 'express';
import {
  handleWhatsAppWebhook,
  validateWhatsAppWebhook,
  sendWhatsAppMessage,
  getWhatsAppConversation,
  markWhatsAppAsRead,
  getWhatsAppStatus,
  toggleWhatsAppNotifications,
  getWhatsAppStats
} from '../controllers/whatsappWebhook.js';

const router = express.Router();

/**
 * POST /api/whatsapp/webhook - Recebe mensagens do WhatsApp
 * GET /api/whatsapp/webhook - Valida token do webhook
 */
router.get('/webhook', validateWhatsAppWebhook);
router.post('/webhook', handleWhatsAppWebhook);

/**
 * POST /api/whatsapp/send - Envia mensagem
 */
router.post('/send', sendWhatsAppMessage);

/**
 * GET /api/whatsapp/conversation/:leadId - Obtém conversação
 */
router.get('/conversation/:leadId', getWhatsAppConversation);

/**
 * PUT /api/whatsapp/:leadId/read - Marca como lida
 */
router.put('/:leadId/read', markWhatsAppAsRead);

/**
 * GET /api/whatsapp/:leadId/status - Obtém status de mensagens
 */
router.get('/:leadId/status', getWhatsAppStatus);

/**
 * PUT /api/whatsapp/:leadId/notifications - Ativa/desativa notificações
 */
router.put('/:leadId/notifications', toggleWhatsAppNotifications);

/**
 * GET /api/whatsapp/stats - Estatísticas de WhatsApp
 */
router.get('/stats', getWhatsAppStats);

export default router;
