import { PrismaClient, LeadTask } from '@prisma/client';

const prisma = new PrismaClient();

export class TaskService {
  /**
   * Listar tarefas de um lead
   */
  async getTasksByLead(leadId: string): Promise<LeadTask[]> {
    return prisma.leadTask.findMany({
      where: { leadId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Listar todas as tarefas (com dados do lead vinculado)
   */
  async getAllTasks(filters?: { completed?: boolean; leadId?: string }): Promise<LeadTask[]> {
    return prisma.leadTask.findMany({
      where: {
        ...(filters?.completed !== undefined && { completed: filters.completed }),
        ...(filters?.leadId && { leadId: filters.leadId }),
      },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Contar tarefas pendentes por lead (para indicador no card do Kanban)
   */
  async countPendingByLeadIds(leadIds: string[]): Promise<Record<string, number>> {
    if (leadIds.length === 0) return {};

    const groups = await prisma.leadTask.groupBy({
      by: ['leadId'],
      where: { leadId: { in: leadIds }, completed: false },
      _count: { _all: true },
    });

    const result: Record<string, number> = {};
    for (const group of groups) {
      result[group.leadId] = group._count._all;
    }
    return result;
  }

  /**
   * Criar nova tarefa
   */
  async createTask(data: {
    leadId: string;
    title: string;
    description?: string;
    dueDate?: Date;
    createdById: string;
    attachmentUrl?: string;
    attachmentName?: string;
  }): Promise<LeadTask> {
    return prisma.leadTask.create({
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Atualizar tarefa (título, descrição, prazo, conclusão)
   */
  async updateTask(
    id: string,
    data: Partial<{ title: string; description: string; dueDate: Date | null; completed: boolean }>
  ): Promise<LeadTask> {
    const updateData: any = { ...data };

    if (data.completed === true) {
      updateData.completedAt = new Date();
    } else if (data.completed === false) {
      updateData.completedAt = null;
    }

    return prisma.leadTask.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Deletar tarefa
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      await prisma.leadTask.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const taskService = new TaskService();
