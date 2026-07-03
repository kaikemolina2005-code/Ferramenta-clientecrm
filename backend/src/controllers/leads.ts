import { Request, Response } from 'express';
import { leadService } from '../services/leadService.js';
import { socketService } from '../socket/service.js';
import { emailService } from '../services/emailService.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

/**
 * GET /leads
 * Obter todos os leads com filtros opcionais
 */
export async function getLeads(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, category, responsible, skip, take } = req.query;

    const options: any = {
      skip: skip ? parseInt(skip as string) : 0,
      take: take ? parseInt(take as string) : 10,
    };

    if (status) options.status = status;
    if (category) options.category = category;
    if (responsible) {
      options.responsibleId = responsible;
    }

    const { leads, total } = await leadService.getAllLeads(options);

    res.json({
      success: true,
      data: leads,
      total,
      page: options.skip / options.take + 1,
      pageSize: options.take,
    });
  } catch (error: any) {
    console.error('Get leads error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao buscar leads',
    });
  }
}

/**
 * GET /leads/:id
 * Obter lead por ID
 */
export async function getLeadById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const lead = await leadService.getLeadById(id);

    if (!lead) {
      return res.status(404).json({
        error: 'Lead não encontrado',
      });
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    console.error('Get lead error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao buscar lead',
    });
  }
}

/**
 * POST /leads
 * Criar novo lead
 */
export async function createLead(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, phone, email, cpf, whatsappId, birthDate, address, neighborhood, city, state, zipCode, nationality, maritalStatus, profession, category, source } = req.body;

    if (!name || !phone || !email || !source) {
      return res.status(400).json({
        error: 'Nome, telefone, email e source são obrigatórios',
      });
    }

    const lead = await leadService.createLead({
      name,
      phone,
      email,
      cpf,
      whatsappId: whatsappId || undefined,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      address,
      neighborhood,
      city,
      state,
      zipCode,
      nationality,
      maritalStatus,
      profession,
      category: category || 'CONSULTATION',
      responsibleId: req.userId,
      source,
    });

    // Send confirmation email to new lead
    if (email) {
      console.log(`📧 Sending confirmation email to: ${name} (${email})`);
      await emailService.sendLeadConfirmationEmail(name, email).catch((err) => {
        console.error('Failed to send confirmation email:', err.message);
      });
    }

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    console.error('Create lead error:', error);
    res.status(400).json({
      error: error.message || 'Erro ao criar lead',
    });
  }
}

/**
 * PUT /leads/:id
 * Atualizar lead
 */
export async function updateLead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get previous lead state for comparison
    const previousLead = await leadService.getLeadById(id);

    const lead = await leadService.updateLead(id, updateData);

    // Emit real-time event if status changed
    if (updateData.status && previousLead?.status !== updateData.status) {
      socketService.emitLeadStatusChanged({
        leadId: id,
        previousStatus: previousLead?.status || 'Inicial',
        newStatus: updateData.status,
        timestamp: new Date(),
        userId: req.userId || 'system',
        userName: req.user?.name || 'Usuário',
      });
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    console.error('Update lead error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao atualizar lead',
    });
  }
}

/**
 * PATCH /leads/:id/status
 * Atualizar status do lead
 */
export async function updateLeadStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status é obrigatório',
      });
    }

    // Get lead data before update
    const previousLead = await leadService.getLeadById(id);

    const lead = await leadService.updateLeadStatus(id, status);

    // Emit real-time event
    socketService.emitLeadStatusChanged({
      leadId: id,
      previousStatus: previousLead?.status || 'Inicial',
      newStatus: status,
      timestamp: new Date(),
      userId: req.userId || 'system',
      userName: req.user?.name || 'Usuário',
    });

    // If status is "Convertido", also emit conversion event and send emails
    if (status === 'Convertido') {
      socketService.emitLeadConverted({
        leadId: id,
        leadName: lead?.name || 'Lead',
        conversionValue: 0, // TODO: Calculate from associated cases
        timestamp: new Date(),
        userId: req.userId || 'system',
        userName: req.user?.name || 'Usuário',
      });

      // Send email notification to team
      if (lead?.email && lead?.phone) {
        console.log(`📧 Sending conversion email for lead: ${lead.name}`);
        await emailService.sendLeadConversionEmail(
          lead.name || 'Lead',
          lead.email,
          lead.phone
        );
      }
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    console.error('Update lead status error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao atualizar status do lead',
    });
  }
}

/**
 * DELETE /leads/:id
 * Deletar lead
 */
export async function deleteLead(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const reason = (req.body?.reason || '').toString().trim();

    // Motivo é obrigatório (registrado no histórico para o ADM)
    if (!reason) {
      return res.status(400).json({
        error: 'É obrigatório informar o motivo da exclusão',
      });
    }

    const success = await leadService.deleteLead(id, {
      userId: req.userId,
      reason,
    });

    if (!success) {
      return res.status(404).json({
        error: 'Lead não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Lead deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao deletar lead',
    });
  }
}

/**
 * GET /leads/:id/activity
 * Linha do tempo de atividades de um lead
 */
export async function getLeadActivity(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const activities = await leadService.getLeadActivity(id);
    res.json({ success: true, data: activities });
  } catch (error: any) {
    console.error('Lead activity error:', error);
    res.status(500).json({ error: error.message || 'Erro ao obter atividades' });
  }
}

/**
 * GET /leads/deletion-logs
 * Histórico de exclusões de leads (quem apagou, quando e por quê)
 */
export async function getDeletionLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const logs = await leadService.getDeletionLogs(limit);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('Deletion logs error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao obter histórico de exclusões',
    });
  }
}

/**
 * GET /leads/search/:query
 * Buscar leads
 */
export async function searchLeads(req: AuthenticatedRequest, res: Response) {
  try {
    const { query } = req.params;

    if (!query || query.length < 2) {
      return res.status(400).json({
        error: 'Query deve ter no mínimo 2 caracteres',
      });
    }

    const leads = await leadService.searchLeads(query);

    res.json({
      success: true,
      data: leads,
    });
  } catch (error: any) {
    console.error('Search leads error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao buscar leads',
    });
  }
}

/**
 * GET /leads/stats
 * Obter estatísticas de leads
 */
export async function getLeadStatistics(_req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await leadService.getLeadStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get lead statistics error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao obter estatísticas',
    });
  }
}
