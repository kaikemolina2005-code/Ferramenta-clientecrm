import { Router } from 'express';
import {
  validateWebhook,
  receiveMessage,
  getConnectionStatus,
  sendTestMessage,
  getMessageLogs,
  getWhatsAppStats,
} from '../controllers/whatsapp';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Webhook do WhatsApp - Verificação (GET)
 * Usado para validar o webhook na configuração
 */
router.get('/webhook', validateWebhook);

/**
 * Webhook do WhatsApp - Recebimento (POST)
 * Recebe mensagens do WhatsApp Business API
 * Sem autenticação para permitir chamadas do WhatsApp
 */
router.post('/webhook', receiveMessage);

/**
 * Status de conexão
 * GET /api/whatsapp/status
 */
router.get('/status', authMiddleware, getConnectionStatus);

/**
 * Enviar mensagem de teste
 * POST /api/whatsapp/send-test
 */
router.post('/send-test', authMiddleware, sendTestMessage);

/**
 * Obter logs de mensagens
 * GET /api/whatsapp/logs
 */
router.get('/logs', authMiddleware, getMessageLogs);

/**
 * Obter estatísticas de leads via WhatsApp
 * GET /api/whatsapp/stats
 */
router.get('/stats', authMiddleware, getWhatsAppStats);

export default router;
