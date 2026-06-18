import { Router } from 'express';
import { createLeadFromTypebot, checkLeadByPhone } from '../controllers/typebotWebhook.js';

const router = Router();

// POST /api/typebot/lead — cria ou atualiza lead a partir do fluxo do Typebot
router.post('/lead', createLeadFromTypebot);

// GET /api/typebot/lead/check?phone=xxx — verifica se o cliente já é cadastrado
router.get('/lead/check', checkLeadByPhone);

export default router;
