import { PrismaClient, KanbanSector } from '@prisma/client';

import { prisma } from './prisma';

interface AssignmentResult {
  success: boolean;
  leadId: string;
  assignedTo?: string;
  reason?: string;
  error?: string;
}

class AutoAssignmentService {
  /**
   * Auto-atribui um lead ao usuário mais apropriado
   */
  async autoAssignLead(leadId: string): Promise<AssignmentResult> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          responsible: true
        }
      });

      if (!lead) {
        return {
          success: false,
          leadId,
          error: 'Lead não encontrado'
        };
      }

      // Se já tem responsável, retornar
      if (lead.responsible) {
        return {
          success: false,
          leadId,
          error: 'Lead já possui responsável'
        };
      }

      // Encontrar o melhor match de usuário
      const bestMatch = await this.findBestUserMatch(lead);

      if (!bestMatch) {
        return {
          success: false,
          leadId,
          error: 'Nenhum usuário disponível para atribuição'
        };
      }

      // Atribuir lead ao usuário
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          responsibleId: bestMatch.userId,
          autoAssignedAt: new Date()
        }
      });

      // Criar Kanban card
      await prisma.kanbanCard.create({
        data: {
          leadId,
          sector: this.getSectorForCategory(lead.category),
          stage: 'todo',
          responsibleId: bestMatch.userId,
          notes: `Auto-atribuído via scoring (score: ${lead.score})`
        }
      });

      // Atualizar workload do usuário
      await this.updateUserWorkload(bestMatch.userId);

      // Log de automação
      await prisma.automationLog.create({
        data: {
          leadId,
          action: 'ASSIGN_TO_USER',
          status: 'EXECUTED',
          details: JSON.stringify({
            assignedTo: bestMatch.userId,
            userName: bestMatch.name,
            reason: `Score: ${lead.score}, Specialty Match: ${bestMatch.matchReason}`
          })
        }
      });

      console.log(`✅ Lead ${lead.name} auto-atribuído a ${bestMatch.name} (score: ${lead.score})`);

      return {
        success: true,
        leadId,
        assignedTo: bestMatch.userId,
        reason: bestMatch.matchReason
      };
    } catch (error) {
      console.error('❌ Erro ao auto-atribuir lead:', error);
      return {
        success: false,
        leadId,
        error: (error as any).message
      };
    }
  }

  /**
   * Encontra o melhor usuário para atribuição
   */
  private async findBestUserMatch(lead: any): Promise<any> {
    try {
      // Buscar usuários com menos carga de trabalho
      const workloads = await prisma.userWorkload.findMany({
        where: {
          isAvailable: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: {
          utilization: 'asc'
        }
      });

      // Filtrar por especialidade (se houver preferência)
      let matches = workloads.filter(w => {
        const utilization = w.activeLeads / Math.max(w.maxCapacity, 1);
        const hasCapacity = utilization < 1.0; // Menos de 100% utilizado
        
        if (!hasCapacity) return false;

        // Check specialties
        try {
          const specialties = JSON.parse(w.specialties || '[]');
          return specialties.includes(lead.category) || specialties.length === 0;
        } catch {
          return true;
        }
      });

      // Se não houver matches com especialidade, tentar qualquer disponível
      if (matches.length === 0) {
        matches = workloads.filter(w => {
          const utilization = w.activeLeads / Math.max(w.maxCapacity, 1);
          return utilization < 1.0;
        });
      }

      if (matches.length === 0) {
        return null;
      }

      // Escolher o primeiro (menor utilização)
      const best = matches[0];

      return {
        userId: best.user.id,
        name: best.user.name,
        role: best.user.role,
        matchReason: `${best.user.name} tem ${best.utilization.toFixed(1)}% utilização`,
        currentWorkload: best.activeLeads,
        capacity: best.maxCapacity
      };
    } catch (error) {
      console.error('❌ Erro ao encontrar melhor usuário:', error);
      return null;
    }
  }

  /**
   * Auto-atribui múltiplos leads (batch)
   */
  async autoAssignMultipleLeads(leadIds: string[]): Promise<AssignmentResult[]> {
    try {
      const results: AssignmentResult[] = [];

      for (const leadId of leadIds) {
        const result = await this.autoAssignLead(leadId);
        results.push(result);
      }

      const successful = results.filter(r => r.success).length;
      console.log(`✅ Atribuição em lote: ${successful}/${leadIds.length} leads atribuídos`);

      return results;
    } catch (error) {
      console.error('❌ Erro ao auto-atribuir múltiplos leads:', error);
      throw error;
    }
  }

  /**
   * Re-balancear atribuições de leads
   */
  async rebalanceAssignments(): Promise<{ rebalanced: number; moved: number }> {
    try {
      // Encontrar leads com responsáveis sobrecarregados
      const overloadedWorkloads = await prisma.userWorkload.findMany({
        where: {
          utilization: {
            gt: 0.8 // Mais de 80% utilizado
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      let rebalanced = 0;
      let moved = 0;

      for (const workload of overloadedWorkloads) {
        // Buscar leads deste usuário com score baixo
        const lowScoreLeads = await prisma.lead.findMany({
          where: {
            responsibleId: workload.userId,
            score: {
              lte: 40
            },
            status: {
              notIn: ['CONVERTED', 'LOSS']
            }
          },
          orderBy: {
            score: 'asc'
          },
          take: 5
        });

        // Reatribuir cada um
        for (const lead of lowScoreLeads) {
          const newAssignment = await this.autoAssignLead(lead.id);
          if (newAssignment.success && newAssignment.assignedTo !== workload.userId) {
            moved++;
          }
        }

        rebalanced += lowScoreLeads.length;
      }

      console.log(`✅ Rebalanceamento: ${rebalanced} leads revisados, ${moved} realocados`);

      return { rebalanced, moved };
    } catch (error) {
      console.error('❌ Erro ao rebalancear:', error);
      throw error;
    }
  }

  /**
   * Atualiza workload de um usuário
   */
  private async updateUserWorkload(userId: string): Promise<void> {
    try {
      const activeLeads = await prisma.lead.count({
        where: {
          responsibleId: userId,
          status: {
            notIn: ['CONVERTED', 'LOSS']
          }
        }
      });

      const workload = await prisma.userWorkload.findUnique({
        where: { userId }
      });

      if (!workload) {
        return;
      }

      const utilization = (activeLeads / Math.max(workload.maxCapacity, 1)) * 100;

      await prisma.userWorkload.update({
        where: { userId },
        data: {
          activeLeads,
          utilization: Math.min(utilization, 100)
        }
      });
    } catch (error) {
      console.warn('⚠️ Erro ao atualizar workload:', error);
    }
  }

  /**
   * Obtém setor apropriado para uma categoria
   */
  private getSectorForCategory(category: string): KanbanSector {
    const mapping: { [key: string]: KanbanSector } = {
      'RETIREMENT': KanbanSector.LEGAL,
      'BPC_LOAS': KanbanSector.LEGAL,
      'PROCESS': KanbanSector.LEGAL,
      'CONSULTATION': KanbanSector.COMMERCIAL
    };
    return mapping[category] || KanbanSector.COMMERCIAL;
  }

  /**
   * Inicializar workload para um usuário
   */
  async initializeUserWorkload(userId: string, maxCapacity: number = 20, specialties: string[] = []): Promise<void> {
    try {
      const existing = await prisma.userWorkload.findUnique({
        where: { userId }
      });

      if (existing) {
        return;
      }

      const activeLeads = await prisma.lead.count({
        where: {
          responsibleId: userId,
          status: {
            notIn: ['CONVERTED', 'LOSS']
          }
        }
      });

      const utilization = (activeLeads / maxCapacity) * 100;

      await prisma.userWorkload.create({
        data: {
          userId,
          maxCapacity,
          specialties: JSON.stringify(specialties),
          activeLeads,
          utilization: Math.min(utilization, 100),
          isAvailable: true
        }
      });

      console.log(`✅ Workload inicializado para usuário ${userId}`);
    } catch (error) {
      console.warn('⚠️ Erro ao inicializar workload:', error);
    }
  }

  /**
   * Listar workload de todos os usuários
   */
  async listUserWorkloads(): Promise<any[]> {
    try {
      const workloads = await prisma.userWorkload.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          utilization: 'asc'
        }
      });

      return workloads.map(w => ({
        userId: w.user.id,
        name: w.user.name,
        email: w.user.email,
        role: w.user.role,
        activeLeads: w.activeLeads,
        maxCapacity: w.maxCapacity,
        utilization: Math.round(w.utilization * 10) / 10,
        isAvailable: w.isAvailable,
        specialties: JSON.parse(w.specialties || '[]')
      }));
    } catch (error) {
      console.error('❌ Erro ao listar workloads:', error);
      throw error;
    }
  }

  /**
   * Atualizar capacidade máxima de um usuário
   */
  async updateUserCapacity(userId: string, maxCapacity: number): Promise<void> {
    try {
      await prisma.userWorkload.update({
        where: { userId },
        data: { maxCapacity }
      });

      console.log(`✅ Capacidade do usuário ${userId} atualizada para ${maxCapacity}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar capacidade:', error);
      throw error;
    }
  }

  /**
   * Atualizar disponibilidade de um usuário
   */
  async updateUserAvailability(userId: string, isAvailable: boolean): Promise<void> {
    try {
      await prisma.userWorkload.update({
        where: { userId },
        data: { isAvailable }
      });

      const status = isAvailable ? 'disponível' : 'indisponível';
      console.log(`✅ Usuário ${userId} marcado como ${status}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar disponibilidade:', error);
      throw error;
    }
  }
}

export const autoAssignmentService = new AutoAssignmentService();
