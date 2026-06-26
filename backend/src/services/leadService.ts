import { PrismaClient } from '@prisma/client';
import { Lead, LeadStatus, LeadCategory } from '@prisma/client';

const prisma = new PrismaClient();

export class LeadService {
  /**
   * Criar novo lead
   */
  async createLead(data: {
    name: string;
    phone: string;
    email: string;
    cpf?: string;
    whatsappId?: string;
    birthDate?: Date;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    category?: LeadCategory;
    responsibleId?: string;
    source: string;
  }): Promise<Lead> {
    return prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        cpf: data.cpf || '',
        whatsappId: data.whatsappId || null,
        birthDate: data.birthDate,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        category: data.category || 'CONSULTATION',
        status: 'INITIAL',
        source: data.source,
        responsibleId: data.responsibleId,
      },
      include: {
        responsible: true,
      },
    });
  }

  /**
   * Obter todos os leads
   */
  async getAllLeads(options?: {
    status?: LeadStatus;
    category?: LeadCategory;
    responsibleId?: string;
    skip?: number;
    take?: number;
  }): Promise<{ leads: Lead[]; total: number }> {
    const where: any = {};

    if (options?.status) {
      where.status = options.status;
    }
    if (options?.category) {
      where.category = options.category;
    }
    if (options?.responsibleId) {
      where.responsibleId = options.responsibleId;
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          responsible: true,
          activities: true,
        },
        skip: options?.skip || 0,
        take: options?.take || 10,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    return { leads, total };
  }

  /**
   * Obter lead por ID
   */
  async getLeadById(id: string): Promise<Lead | null> {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        responsible: true,
        activities: true,
        documents: true,
      },
    });
  }

  /**
   * Atualizar lead
   */
  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data,
      include: {
        responsible: true,
      },
    });
  }

  /**
   * Atualizar status do lead
   */
  async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data: { status },
      include: {
        responsible: true,
      },
    });
  }

  /**
   * Atualizar categoria do lead
   */
  async updateLeadCategory(id: string, category: LeadCategory): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data: { category },
      include: {
        responsible: true,
      },
    });
  }

  /**
   * Deletar lead
   *
   * Antes de apagar, registra no histórico (tabela Activity) QUEM apagou,
   * QUANDO e o MOTIVO. Como Activity.leadId usa onDelete: SetNull, esse
   * registro continua existindo mesmo depois do lead ser removido, servindo
   * de auditoria para o ADM.
   */
  async deleteLead(
    id: string,
    options?: { userId?: string; reason?: string }
  ): Promise<boolean> {
    try {
      // Buscar o lead para guardar um "retrato" dele no histórico
      const lead = await prisma.lead.findUnique({ where: { id } });
      if (!lead) return false;

      // Registrar a exclusão no histórico (só se soubermos quem fez)
      if (options?.userId) {
        await prisma.activity.create({
          data: {
            userId: options.userId,
            leadId: id,
            action: 'deleted_lead',
            details: JSON.stringify({
              leadName: lead.name,
              leadEmail: lead.email,
              leadPhone: lead.phone,
              leadCpf: lead.cpf,
              reason: options.reason || '(sem motivo informado)',
              deletedAt: new Date().toISOString(),
            }),
          },
        });
      }

      await prisma.lead.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Histórico de exclusões de leads (para o ADM revisar)
   */
  async getDeletionLogs(limit = 100) {
    const logs = await prisma.activity.findMany({
      where: { action: 'deleted_lead' },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map((log) => {
      let details: any = {};
      try {
        details = log.details ? JSON.parse(log.details) : {};
      } catch {
        details = {};
      }
      return {
        id: log.id,
        deletedBy: log.user
          ? { name: log.user.name, email: log.user.email }
          : null,
        leadName: details.leadName || null,
        leadEmail: details.leadEmail || null,
        leadPhone: details.leadPhone || null,
        reason: details.reason || null,
        createdAt: log.createdAt,
      };
    });
  }

  /**
   * Buscar leads por filtro
   */
  async searchLeads(query: string): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { cpf: { contains: query } },
        ],
      },
      include: {
        responsible: true,
      },
    });
  }

  /**
   * Obter leads por responsável
   */
  async getLeadsByResponsible(responsibleId: string): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: { responsibleId },
      include: {
        responsible: true,
        activities: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obter estatísticas de leads
   */
  async getLeadStatistics() {
    const [total, byStatus, byCategory] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ['category'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus,
      byCategory,
    };
  }
}

export const leadService = new LeadService();
