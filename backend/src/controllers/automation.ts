import { Request, Response } from 'express';
import { leadScoringService } from '../services/leadScoringService.js';
import { autoAssignmentService } from '../services/autoAssignmentService.js';
import { automationEngine } from '../services/automationEngine.js';
import { AutomationTrigger, AutomationAction } from '@prisma/client';

/**
 * GET /api/automation/leads/scoring - Obter distribuição de scores
 */
export async function getScoreDistribution(req: Request, res: Response) {
  try {
    const distribution = await leadScoringService.getScoreDistribution();

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('❌ Erro ao obter distribuição:', error);
    res.status(500).json({
      error: 'Erro ao obter distribuição de scores'
    });
  }
}

/**
 * GET /api/automation/leads/:id/score - Obter score de um lead
 */
export async function getLeadScore(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const factors = await leadScoringService.getLeadScoringDetails(id);

    if (!factors) {
      return res.status(404).json({
        error: 'Lead ou score não encontrado'
      });
    }

    res.json({
      success: true,
      data: factors
    });
  } catch (error) {
    console.error('❌ Erro ao obter score:', error);
    res.status(500).json({
      error: 'Erro ao obter score do lead'
    });
  }
}

/**
 * POST /api/automation/leads/:id/recalculate-score - Recalcular score
 */
export async function recalculateLeadScore(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { score, factors } = await leadScoringService.calculateLeadScore(id);

    res.json({
      success: true,
      data: {
        leadId: id,
        score,
        factors
      }
    });
  } catch (error) {
    console.error('❌ Erro ao recalcular score:', error);
    res.status(500).json({
      error: 'Erro ao recalcular score'
    });
  }
}

/**
 * POST /api/automation/leads/:id/boost - Boost no score
 */
export async function boostLeadScore(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        error: 'Pontos inválidos (deve ser > 0)'
      });
    }

    const newScore = await leadScoringService.boostLeadScore(id, points, reason || 'Boost manual');

    res.json({
      success: true,
      data: {
        leadId: id,
        newScore
      }
    });
  } catch (error) {
    console.error('❌ Erro ao fazer boost:', error);
    res.status(500).json({
      error: 'Erro ao fazer boost no score'
    });
  }
}

/**
 * GET /api/automation/leads/quality/high - Obter high-quality leads
 */
export async function getHighQualityLeads(req: Request, res: Response) {
  try {
    const { minScore = 70 } = req.query;

    const leads = await leadScoringService.getHighQualityLeads(parseInt(minScore as string));

    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error('❌ Erro ao obter leads:', error);
    res.status(500).json({
      error: 'Erro ao obter high-quality leads'
    });
  }
}

/**
 * GET /api/automation/leads/quality/low - Obter low-quality leads
 */
export async function getLowQualityLeads(req: Request, res: Response) {
  try {
    const { maxScore = 30 } = req.query;

    const leads = await leadScoringService.getLowScoreLeads(parseInt(maxScore as string));

    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error('❌ Erro ao obter leads:', error);
    res.status(500).json({
      error: 'Erro ao obter low-quality leads'
    });
  }
}

/**
 * POST /api/automation/leads/:id/assign - Auto-atribuir um lead
 */
export async function assignLead(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await autoAssignmentService.autoAssignLead(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao atribuir:', error);
    res.status(500).json({
      error: 'Erro ao auto-atribuir lead'
    });
  }
}

/**
 * POST /api/automation/leads/batch/assign - Atribuir múltiplos leads
 */
export async function assignMultipleLeads(req: Request, res: Response) {
  try {
    const { leadIds } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({
        error: 'leadIds deve ser um array não-vazio'
      });
    }

    const results = await autoAssignmentService.autoAssignMultipleLeads(leadIds);

    const successful = results.filter(r => r.success).length;

    res.json({
      success: true,
      summary: {
        total: leadIds.length,
        successful,
        failed: leadIds.length - successful
      },
      data: results
    });
  } catch (error) {
    console.error('❌ Erro ao atribuir em lote:', error);
    res.status(500).json({
      error: 'Erro ao atribuir múltiplos leads'
    });
  }
}

/**
 * POST /api/automation/rebalance - Rebalancear atribuições
 */
export async function rebalanceAssignments(req: Request, res: Response) {
  try {
    const result = await autoAssignmentService.rebalanceAssignments();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao rebalancear:', error);
    res.status(500).json({
      error: 'Erro ao rebalancear atribuições'
    });
  }
}

/**
 * GET /api/automation/workload - Listar workload de usuários
 */
export async function getUserWorkloads(req: Request, res: Response) {
  try {
    const workloads = await autoAssignmentService.listUserWorkloads();

    res.json({
      success: true,
      count: workloads.length,
      data: workloads
    });
  } catch (error) {
    console.error('❌ Erro ao listar workloads:', error);
    res.status(500).json({
      error: 'Erro ao listar workloads'
    });
  }
}

/**
 * PUT /api/automation/workload/:userId/capacity - Atualizar capacidade
 */
export async function updateUserCapacity(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { maxCapacity } = req.body;

    if (!maxCapacity || maxCapacity <= 0) {
      return res.status(400).json({
        error: 'Capacidade inválida'
      });
    }

    await autoAssignmentService.updateUserCapacity(userId, maxCapacity);

    res.json({
      success: true,
      message: `Capacidade atualizada para ${maxCapacity}`
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar capacidade:', error);
    res.status(500).json({
      error: 'Erro ao atualizar capacidade'
    });
  }
}

/**
 * POST /api/automation/rules - Criar regra de automação
 */
export async function createAutomationRule(req: Request, res: Response) {
  try {
    const { name, description, trigger, triggerValue, action, actionValue, sequenceId, priority } = req.body;

    if (!name || !trigger || !action) {
      return res.status(400).json({
        error: 'name, trigger e action são obrigatórios'
      });
    }

    const rule = await automationEngine.createAutomationRule({
      name,
      description,
      trigger: trigger as AutomationTrigger,
      triggerValue,
      action: action as AutomationAction,
      actionValue,
      sequenceId,
      priority
    });

    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('❌ Erro ao criar regra:', error);
    res.status(500).json({
      error: 'Erro ao criar regra'
    });
  }
}

/**
 * GET /api/automation/rules - Listar regras
 */
export async function listRules(req: Request, res: Response) {
  try {
    const { active } = req.query;

    const rules = await automationEngine.listRules(
      active === 'true' ? true : active === 'false' ? false : undefined
    );

    res.json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    console.error('❌ Erro ao listar regras:', error);
    res.status(500).json({
      error: 'Erro ao listar regras'
    });
  }
}

/**
 * DELETE /api/automation/rules/:id - Desativar regra
 */
export async function disableRule(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await automationEngine.disableRule(id);

    res.json({
      success: true,
      message: 'Regra desativada'
    });
  } catch (error) {
    console.error('❌ Erro ao desativar regra:', error);
    res.status(500).json({
      error: 'Erro ao desativar regra'
    });
  }
}

/**
 * POST /api/automation/execute - Executar automação para um lead
 */
export async function executeAutomation(req: Request, res: Response) {
  try {
    const { leadId, trigger } = req.body;

    if (!leadId || !trigger) {
      return res.status(400).json({
        error: 'leadId e trigger são obrigatórios'
      });
    }

    const results = await automationEngine.executeAutomation(leadId, trigger as AutomationTrigger);

    res.json({
      success: true,
      leadId,
      trigger,
      executedRules: results.length,
      data: results
    });
  } catch (error) {
    console.error('❌ Erro ao executar automação:', error);
    res.status(500).json({
      error: 'Erro ao executar automação'
    });
  }
}

/**
 * POST /api/automation/scheduled - Executar automações agendadas
 */
export async function executeScheduledAutomations(req: Request, res: Response) {
  try {
    const result = await automationEngine.executeScheduledAutomations();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao executar automações:', error);
    res.status(500).json({
      error: 'Erro ao executar automações agendadas'
    });
  }
}

/**
 * GET /api/automation/logs - Obter logs de automação
 */
export async function getAutomationLogs(req: Request, res: Response) {
  try {
    const { leadId, limit = 50 } = req.query;

    const logs = await automationEngine.getAutomationLogs(
      leadId as string | undefined,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('❌ Erro ao obter logs:', error);
    res.status(500).json({
      error: 'Erro ao obter logs'
    });
  }
}
