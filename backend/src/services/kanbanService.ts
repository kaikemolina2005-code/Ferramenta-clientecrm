import { PrismaClient, KanbanSector } from '@prisma/client';
import { KanbanCard } from '@prisma/client';

import { prisma } from './prisma';

export class KanbanService {
  /**
   * Obter todos os cards do Kanban
   */
  async getCards(sector?: KanbanSector): Promise<KanbanCard[]> {
    const where: any = {};
    if (sector) {
      where.sector = sector;
    }

    return prisma.kanbanCard.findMany({
      where,
      include: {
        lead: {
          include: {
            responsible: true,
            tasks: {
              where: { completed: false },
              select: { id: true },
            },
          },
        },
        responsible: true,
      },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Obter um card por ID
   */
  async getCard(id: string): Promise<KanbanCard | null> {
    return prisma.kanbanCard.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            responsible: true,
            tasks: {
              where: { completed: false },
              select: { id: true },
            },
          },
        },
        responsible: true,
      },
    });
  }

  /**
   * Obter cards por setor
   */
  async getCardsBySector(sector: KanbanSector): Promise<KanbanCard[]> {
    return prisma.kanbanCard.findMany({
      where: { sector },
      include: {
        lead: {
          include: {
            responsible: true,
            tasks: {
              where: { completed: false },
              select: { id: true },
            },
          },
        },
        responsible: true,
      },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Criar novo card
   */
  async createCard(data: {
    leadId: string;
    sector: KanbanSector;
    stage: string;
    position: number;
    responsibleId?: string;
    notes?: string;
  }): Promise<KanbanCard> {
    return prisma.kanbanCard.create({
      data,
      include: {
        lead: {
          include: {
            responsible: true,
            tasks: {
              where: { completed: false },
              select: { id: true },
            },
          },
        },
        responsible: true,
      },
    });
  }

  /**
   * Atualizar card
   */
  async updateCard(id: string, data: Partial<KanbanCard>): Promise<KanbanCard> {
    return prisma.kanbanCard.update({
      where: { id },
      data,
      include: {
        lead: {
          include: {
            responsible: true,
            tasks: {
              where: { completed: false },
              select: { id: true },
            },
          },
        },
        responsible: true,
      },
    });
  }

  /**
   * Mover card entre setores/stages
   */
  async moveCard(id: string, sector: KanbanSector, stage: string, position: number, movedBy: string): Promise<KanbanCard> {
    return prisma.kanbanCard.update({
      where: { id },
      data: {
        sector,
        stage,
        position,
        movedBy,
        movedAt: new Date(),
      },
      include: {
        lead: {
          include: {
            responsible: true,
            tasks: {
              where: { completed: false },
              select: { id: true },
            },
          },
        },
        responsible: true,
      },
    });
  }

  /**
   * Atualizar notas do card
   */
  async updateCardNotes(id: string, notes: string): Promise<KanbanCard> {
    return prisma.kanbanCard.update({
      where: { id },
      data: { notes },
      include: {
        lead: {
          include: {
            responsible: true,
            tasks: {
              where: { completed: false },
              select: { id: true },
            },
          },
        },
        responsible: true,
      },
    });
  }

  /**
   * Deletar card
   */
  async deleteCard(id: string): Promise<boolean> {
    try {
      await prisma.kanbanCard.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter cards por responsável
   */
  async getCardsByResponsible(responsibleId: string): Promise<KanbanCard[]> {
    return prisma.kanbanCard.findMany({
      where: { responsibleId },
      include: {
        lead: {
          include: {
            responsible: true,
            tasks: {
              where: { completed: false },
              select: { id: true },
            },
          },
        },
        responsible: true,
      },
      orderBy: { position: 'asc' },
    });
  }
}

export const kanbanService = new KanbanService();
