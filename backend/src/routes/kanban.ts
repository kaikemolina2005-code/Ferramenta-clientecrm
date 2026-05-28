// Kanban routes
import { Router } from 'express';
import * as kanbanController from '../controllers/kanban.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Middleware - All routes require authentication
router.use(authMiddleware);

// GET /kanban - Get all cards or by sector
router.get('/', kanbanController.getKanbanCards);

// GET /kanban/sector/:sector - Get cards by sector
router.get('/sector/:sector', kanbanController.getCardsBySector);

// POST /kanban - Create new card
router.post('/', kanbanController.createKanbanCard);

// POST /kanban/lead/:leadId - Create card from lead
router.post('/lead/:leadId', kanbanController.createCardFromLead);

// PUT /kanban/:id - Update/Move card
router.put('/:id', kanbanController.updateKanbanCard);

// DELETE /kanban/:id - Delete card
router.delete('/:id', kanbanController.deleteKanbanCard);

export default router;
