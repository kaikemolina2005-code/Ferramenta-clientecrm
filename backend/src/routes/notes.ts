// Rotas de notas/histórico do lead
import { Router } from 'express';
import * as notesController from '../controllers/notes.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// GET /notes/lead/:leadId - Lista as notas de um lead
router.get('/lead/:leadId', notesController.getLeadNotes);

// POST /notes/lead/:leadId - Cria nota para um lead
router.post('/lead/:leadId', notesController.createNote);

// DELETE /notes/:noteId - Remove uma nota
router.delete('/:noteId', notesController.deleteNote);

export default router;
