import express from 'express';
import * as sequencesController from '../controllers/sequences.js';

const router = express.Router();

/**
 * Email Sequences Routes (Passo 8)
 */

// POST /api/sequences - Criar nova sequência
router.post('/', sequencesController.createSequence);

// GET /api/sequences - Listar sequências
router.get('/', sequencesController.listSequences);

// GET /api/sequences/:id/stats - Estatísticas de sequência
router.get('/:id/stats', sequencesController.getSequenceStats);

// GET /api/sequences/:id - Detalhes de sequência
router.get('/:id', sequencesController.getSequence);

// POST /api/sequences/:id/trigger - Dispara sequência para um lead
router.post('/:id/trigger', sequencesController.triggerSequenceForLead);

// PUT /api/sequences/:id/pause - Pausa sequência
router.put('/:id/pause', sequencesController.pauseSequence);

// PUT /api/sequences/:id/resume - Retoma sequência
router.put('/:id/resume', sequencesController.resumeSequence);

// POST /api/sequences/admin/process-scheduled - Processa emails agendados (admin)
router.post('/admin/process-scheduled', sequencesController.processScheduledEmails);

export default router;
