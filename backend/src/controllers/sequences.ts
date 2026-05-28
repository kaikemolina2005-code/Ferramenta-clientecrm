import { Request, Response } from 'express';
import { emailSequenceService } from '../services/emailSequenceService.js';
import { SequenceTrigger, LeadCategory } from '@prisma/client';

/**
 * Cria uma nova sequência de email
 * POST /api/sequences
 */
export async function createSequence(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      trigger,
      triggerValue,
      isActive,
      priority,
      steps,
      maxRetries,
      retryDelayMin
    } = req.body;

    // Validações
    if (!name || !trigger || !steps || steps.length === 0) {
      return res.status(400).json({
        error: 'name, trigger e steps são obrigatórios'
      });
    }

    // Validar trigger
    if (!Object.values(SequenceTrigger).includes(trigger)) {
      return res.status(400).json({
        error: `Trigger inválido. Use: ${Object.values(SequenceTrigger).join(', ')}`
      });
    }

    // Validar steps
    const validTemplates = ['welcome', 'confirmation', 'follow_up', 'survey', 'conversion'];
    for (const step of steps) {
      if (!step.template || !validTemplates.includes(step.template)) {
        return res.status(400).json({
          error: `Template inválido: ${step.template}. Use: ${validTemplates.join(', ')}`
        });
      }
      if (!step.subject) {
        return res.status(400).json({ error: 'Cada step precisa de um subject' });
      }
    }

    const sequence = await emailSequenceService.createSequence({
      name,
      description,
      trigger,
      triggerValue,
      isActive: isActive ?? true,
      priority: priority ?? 0,
      steps,
      maxRetries: maxRetries ?? 3,
      retryDelayMin: retryDelayMin ?? 60
    });

    res.status(201).json({
      success: true,
      data: sequence
    });
  } catch (error) {
    console.error('❌ Erro ao criar sequência:', error);
    res.status(500).json({
      error: 'Erro ao criar sequência',
      details: (error as any).message
    });
  }
}

/**
 * Lista todas as sequências
 * GET /api/sequences
 */
export async function listSequences(req: Request, res: Response) {
  try {
    const { active } = req.query;
    
    const sequences = await emailSequenceService.listSequences(
      active === 'true' ? true : active === 'false' ? false : undefined
    );

    res.json({
      success: true,
      data: sequences,
      total: sequences.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar sequências:', error);
    res.status(500).json({
      error: 'Erro ao listar sequências'
    });
  }
}

/**
 * Obtém detalhes de uma sequência
 * GET /api/sequences/:id
 */
export async function getSequence(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { progress } = await emailSequenceService.getSequenceProgress(id);

    if (!progress) {
      return res.status(404).json({ error: 'Sequência não encontrada' });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('❌ Erro ao obter sequência:', error);
    res.status(500).json({
      error: 'Erro ao obter sequência'
    });
  }
}

/**
 * Obtém estatísticas de uma sequência
 * GET /api/sequences/:id/stats
 */
export async function getSequenceStats(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { progress, stats } = await emailSequenceService.getSequenceProgress(id);

    res.json({
      success: true,
      sequenceId: id,
      stats,
      progression: progress.map(p => ({
        leadId: p.lead.id,
        leadName: p.lead.name,
        currentStep: p.currentStep,
        status: p.status,
        progress: `${p.currentStep} steps`,
        nextStepAt: p.nextStepAt,
        completedAt: p.completedAt
      }))
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao obter estatísticas'
    });
  }
}

/**
 * Dispara uma sequência para um lead
 * POST /api/sequences/:id/trigger
 */
export async function triggerSequenceForLead(req: Request, res: Response) {
  try {
    const { id: sequenceId } = req.params;
    const { leadId, trigger, category } = req.body;

    if (!leadId || !trigger) {
      return res.status(400).json({
        error: 'leadId e trigger são obrigatórios'
      });
    }

    const progress = await emailSequenceService.triggerSequence(
      leadId,
      trigger as SequenceTrigger,
      category as LeadCategory
    );

    if (!progress) {
      return res.status(404).json({
        error: 'Lead não encontrado ou sem email'
      });
    }

    res.status(201).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('❌ Erro ao disparar sequência:', error);
    res.status(500).json({
      error: 'Erro ao disparar sequência',
      details: (error as any).message
    });
  }
}

/**
 * Pausa uma sequência para um lead
 * PUT /api/sequences/:id/pause
 */
export async function pauseSequence(req: Request, res: Response) {
  try {
    const { id: sequenceId } = req.params;
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: 'leadId é obrigatório' });
    }

    const updated = await emailSequenceService.pauseSequence(leadId, sequenceId);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('❌ Erro ao pausar sequência:', error);
    res.status(500).json({
      error: 'Erro ao pausar sequência'
    });
  }
}

/**
 * Retoma uma sequência para um lead
 * PUT /api/sequences/:id/resume
 */
export async function resumeSequence(req: Request, res: Response) {
  try {
    const { id: sequenceId } = req.params;
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: 'leadId é obrigatório' });
    }

    const updated = await emailSequenceService.resumeSequence(leadId, sequenceId);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('❌ Erro ao retomar sequência:', error);
    res.status(500).json({
      error: 'Erro ao retomar sequência'
    });
  }
}

/**
 * Processa emails agendados (usado pelo scheduler)
 * POST /api/sequences/admin/process-scheduled
 */
export async function processScheduledEmails(req: Request, res: Response) {
  try {
    const count = await emailSequenceService.processScheduledEmails();

    res.json({
      success: true,
      message: `${count} emails processados`,
      processedCount: count
    });
  } catch (error) {
    console.error('❌ Erro ao processar emails agendados:', error);
    res.status(500).json({
      error: 'Erro ao processar emails agendados'
    });
  }
}
