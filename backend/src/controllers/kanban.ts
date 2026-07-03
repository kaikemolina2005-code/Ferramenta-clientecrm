import { Request, Response } from 'express';
import { kanbanService } from '../services/kanbanService.js';
import { leadService } from '../services/leadService.js';
import { socketService } from '../socket/service.js';
import { prisma } from '../services/prisma.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

const KANBAN_CONFIG_KEY = 'kanban_stages_config';

/**
 * GET /kanban/config
 * Configuração compartilhada das colunas do CRM (nomes, adicionadas, removidas)
 */
export async function getKanbanConfig(_req: AuthenticatedRequest, res: Response) {
  try {
    const rows = await prisma.$queryRawUnsafe<{ value: string }[]>(
      `SELECT "value" FROM "AppSetting" WHERE "key" = $1`,
      KANBAN_CONFIG_KEY
    );
    const value = rows?.[0]?.value ? JSON.parse(rows[0].value) : {};
    res.json({ success: true, data: value });
  } catch (error: any) {
    console.error('Get kanban config error:', error);
    res.status(500).json({ error: error.message || 'Erro ao obter configuração' });
  }
}

/**
 * PUT /kanban/config
 * Salva a configuração compartilhada das colunas do CRM
 */
export async function saveKanbanConfig(req: AuthenticatedRequest, res: Response) {
  try {
    const config = req.body || {};
    const value = JSON.stringify(config);
    await prisma.$executeRawUnsafe(
      `INSERT INTO "AppSetting" ("key", "value") VALUES ($1, $2)
       ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value"`,
      KANBAN_CONFIG_KEY,
      value
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error('Save kanban config error:', error);
    res.status(500).json({ error: error.message || 'Erro ao salvar configuração' });
  }
}

/**
 * GET /kanban
 * Obter todos os cards do Kanban com filtro opcional por setor
 */
export async function getKanbanCards(req: AuthenticatedRequest, res: Response) {
  try {
    const { sector } = req.query;

    let cards;
    if (sector) {
      cards = await kanbanService.getCardsBySector(sector as any);
    } else {
      cards = await kanbanService.getCards();
    }

    res.json({
      success: true,
      data: cards,
    });
  } catch (error: any) {
    console.error('Get kanban cards error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao buscar cards do Kanban',
    });
  }
}

/**
 * POST /kanban
 * Criar novo card
 */
export async function createKanbanCard(req: AuthenticatedRequest, res: Response) {
  try {
    const { leadId, sector, stage, position, notes } = req.body;

    if (!leadId || !sector || !stage) {
      return res.status(400).json({
        error: 'leadId, sector e stage são obrigatórios',
      });
    }

    const card = await kanbanService.createCard({
      leadId,
      sector,
      stage,
      position: position || 0,
      responsibleId: req.userId,
      notes,
    });

    // Get lead name for event
    const lead = await leadService.getLeadById(leadId);

    // Emit real-time event
    socketService.emitKanbanCardCreated({
      cardId: card.id,
      leadId,
      sector,
      title: lead?.name || 'Lead',
      timestamp: new Date(),
      userId: req.userId || 'system',
      userName: req.user?.name || 'Usuário',
    });

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (error: any) {
    console.error('Create kanban card error:', error);
    res.status(400).json({
      error: error.message || 'Erro ao criar card',
    });
  }
}

/**
 * PUT /kanban/:id
 * Atualizar card (mover ou editar notas)
 */
export async function updateKanbanCard(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { sector, stage, position, notes } = req.body;

    let card;

    if (sector || stage || position !== undefined) {
      // Mover card
      const oldCard = await kanbanService.getCard(id);
      
      card = await kanbanService.moveCard(
        id,
        sector || undefined,
        stage || undefined,
        position || 0,
        req.userId || 'unknown'
      );

      // Emit real-time event
      socketService.emitKanbanCardMoved({
        cardId: id,
        leadId: card.leadId,
        fromSector: (oldCard?.sector || sector) as 'COMMERCIAL' | 'LEGAL' | 'ADMINISTRATIVE',
        toSector: sector as 'COMMERCIAL' | 'LEGAL' | 'ADMINISTRATIVE',
        fromPosition: oldCard?.position || 0,
        toPosition: position || 0,
        timestamp: new Date(),
        userId: req.userId || 'system',
        userName: req.user?.name || 'Usuário',
      });
    } else if (notes !== undefined) {
      // Atualizar notas
      card = await kanbanService.updateCardNotes(id, notes);
    } else {
      return res.status(400).json({
        error: 'Forneça sector, stage, position ou notes para atualizar',
      });
    }

    res.json({
      success: true,
      data: card,
    });
  } catch (error: any) {
    console.error('Update kanban card error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao atualizar card',
    });
  }
}

/**
 * DELETE /kanban/:id
 * Deletar card
 */
export async function deleteKanbanCard(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    // Get card before deletion for event data
    const card = await kanbanService.getCard(id);

    if (!card) {
      return res.status(404).json({
        error: 'Card não encontrado',
      });
    }

    const success = await kanbanService.deleteCard(id);

    if (!success) {
      return res.status(404).json({
        error: 'Card não encontrado',
      });
    }

    // Emit real-time event
    socketService.emitKanbanCardDeleted({
      cardId: id,
      leadId: card.leadId,
      sector: card.sector as 'COMMERCIAL' | 'LEGAL' | 'ADMINISTRATIVE',
      timestamp: new Date(),
      userId: req.userId || 'system',
      userName: req.user?.name || 'Usuário',
    });

    res.json({
      success: true,
      message: 'Card deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Delete kanban card error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao deletar card',
    });
  }
}

/**
 * POST /kanban/lead/:leadId
 * Criar card a partir de um lead
 */
export async function createCardFromLead(req: AuthenticatedRequest, res: Response) {
  try {
    const { leadId } = req.params;
    const { sector = 'COMMERCIAL', stage = 'todo', position = 0 } = req.body;

    // Verificar se o lead existe
    const lead = await leadService.getLeadById(leadId);
    if (!lead) {
      return res.status(404).json({
        error: 'Lead não encontrado',
      });
    }

    // Criar card
    const card = await kanbanService.createCard({
      leadId,
      sector,
      stage,
      position,
      responsibleId: req.userId,
      notes: `Lead: ${lead.name}`,
    });

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (error: any) {
    console.error('Create card from lead error:', error);
    res.status(400).json({
      error: error.message || 'Erro ao criar card',
    });
  }
}

/**
 * GET /kanban/sector/:sector
 * Obter cards por setor
 */
export async function getCardsBySector(req: AuthenticatedRequest, res: Response) {
  try {
    const { sector } = req.params;

    const cards = await kanbanService.getCardsBySector(sector as any);

    res.json({
      success: true,
      data: cards,
    });
  } catch (error: any) {
    console.error('Get cards by sector error:', error);
    res.status(500).json({
      error: error.message || 'Erro ao buscar cards',
    });
  }
}
