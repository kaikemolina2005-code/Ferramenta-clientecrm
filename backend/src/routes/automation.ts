import express from 'express';
import * as automationController from '../controllers/automation.js';

const router = express.Router();

/**
 * PASSO 10: Advanced Automation Routes
 */

// ═══ LEAD SCORING ═══
router.get('/leads/scoring/distribution', automationController.getScoreDistribution);
router.get('/leads/:id/score', automationController.getLeadScore);
router.post('/leads/:id/recalculate-score', automationController.recalculateLeadScore);
router.post('/leads/:id/boost', automationController.boostLeadScore);
router.get('/leads/quality/high', automationController.getHighQualityLeads);
router.get('/leads/quality/low', automationController.getLowQualityLeads);

// ═══ AUTO-ASSIGNMENT ═══
router.post('/leads/:id/assign', automationController.assignLead);
router.post('/leads/batch/assign', automationController.assignMultipleLeads);
router.post('/rebalance', automationController.rebalanceAssignments);

// ═══ WORKLOAD ═══
router.get('/workload', automationController.getUserWorkloads);
router.put('/workload/:userId/capacity', automationController.updateUserCapacity);

// ═══ AUTOMATION RULES ═══
router.post('/rules', automationController.createAutomationRule);
router.get('/rules', automationController.listRules);
router.delete('/rules/:id', automationController.disableRule);

// ═══ EXECUTION ═══
router.post('/execute', automationController.executeAutomation);
router.post('/scheduled', automationController.executeScheduledAutomations);

// ═══ LOGS ═══
router.get('/logs', automationController.getAutomationLogs);

export default router;
