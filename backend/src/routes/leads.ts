// Lead routes
import { Router } from 'express';
import * as leadsController from '../controllers/leads.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Middleware - All routes require authentication
router.use(authMiddleware);

// GET /leads - Get all leads
router.get('/', leadsController.getLeads);

// GET /leads/stats - Get lead statistics
router.get('/stats', leadsController.getLeadStatistics);

// GET /leads/search/:query - Search leads
router.get('/search/:query', leadsController.searchLeads);

// POST /leads - Create new lead
router.post('/', leadsController.createLead);

// GET /leads/:id - Get lead by ID
router.get('/:id', leadsController.getLeadById);

// PUT /leads/:id - Update lead
router.put('/:id', leadsController.updateLead);

// PATCH /leads/:id/status - Update lead status
router.patch('/:id/status', leadsController.updateLeadStatus);

// DELETE /leads/:id - Delete lead
router.delete('/:id', leadsController.deleteLead);

export default router;
