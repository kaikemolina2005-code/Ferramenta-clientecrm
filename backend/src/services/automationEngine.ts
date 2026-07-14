import { AutomationTrigger, AutomationAction } from '@prisma/client';
import { leadScoringService } from './leadScoringService.js';
import { autoAssignmentService } from './autoAssignmentService.js';
import { emailSequenceService } from './emailSequenceService.js';
import { emailService } from './emailService.js';

import { prisma } from './prisma.js';

class AutomationEngine {
  /**
   * Executa automação para um lead com base em gatilho
   */
  async executeAutomation(leadId: string, trigger: AutomationTrigger): Promise<any[]> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId }
      });

      if (!lead) {
        throw new Error('Lead não encontrado');
      }

      // 1. RECALCULAR SCORE
      await leadScoringService.calculateLeadScore(leadId);

      // 2. BUSCAR REGRAS ATIVAS PARA ESTE GATILHO
      const rules = await prisma.automationRule.findMany({
        where: {
          trigger,
          isActive: true
        },
        orderBy: {
          priority: 'desc'
        },
        include: {
          sequence: true
        }
      });

      console.log(`⚙️ Executando ${rules.length} regras de automação para lead ${lead.name}`);

      const results: any[] = [];

      for (const rule of rules) {
        try {
          const result = await this.executeRule(lead, rule);
          results.push(result);
        } catch (error) {
          console.error(`❌ Erro ao executar regra ${rule.id}:`, error);
          results.push({
            ruleId: rule.id,
            success: false,
            error: (error as any).message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Erro ao executar automação:', error);
      throw error;
    }
  }

  /**
   * Executa uma regra individual
   */
  private async executeRule(lead: any, rule: any): Promise<any> {
    try {
      let shouldExecute = true;

      // Validar condições (se houver)
      if (rule.triggerValue) {
        if (!this.validateTriggerCondition(lead, rule.trigger, rule.triggerValue)) {
          shouldExecute = false;
        }
      }

      if (!shouldExecute) {
        return {
          ruleId: rule.id,
          leadId: lead.id,
          success: false,
          reason: 'Condição não atendida'
        };
      }

      // Executar ação
      const actionResult = await this.executeAction(lead, rule);

      // Registrar log
      await prisma.automationLog.create({
        data: {
          ruleId: rule.id,
          leadId: lead.id,
          action: rule.action,
          status: 'EXECUTED',
          scoreBefore: lead.score,
          scoreAfter: lead.score, // Será atualizado se houver scoring
          details: JSON.stringify(actionResult)
        }
      });

      // Incrementar contador de execução
      await prisma.automationRule.update({
        where: { id: rule.id },
        data: {
          executionCount: {
            increment: 1
          },
          lastExecutedAt: new Date()
        }
      });

      return {
        ruleId: rule.id,
        leadId: lead.id,
        success: true,
        action: rule.action,
        result: actionResult
      };
    } catch (error) {
      console.error('❌ Erro ao executar regra:', error);
      throw error;
    }
  }

  /**
   * Executa ação de automação
   */
  private async executeAction(lead: any, rule: any): Promise<any> {
    switch (rule.action) {
      case 'ASSIGN_TO_USER':
        return await autoAssignmentService.autoAssignLead(lead.id);

      case 'SEND_EMAIL':
        return await emailService.sendEmail(
          lead.email,
          {
            subject: `Atualização sobre seu processo`,
            html: `<p>Olá ${lead.name},</p><p>Nossa equipe entrará em contato em breve.</p>`,
            text: `Olá ${lead.name}, nossa equipe entrará em contato em breve.`,
          }
        );

      case 'TRIGGER_SEQUENCE':
        if (rule.sequence) {
          return await emailSequenceService.triggerSequence(
            lead.id,
            rule.trigger,
            lead.category
          );
        }
        break;

      case 'UPDATE_STATUS':
        return await prisma.lead.update({
          where: { id: lead.id },
          data: { status: rule.actionValue }
        });

      case 'ADD_TO_KANBAN':
        return await prisma.kanbanCard.create({
          data: {
            leadId: lead.id,
            sector: rule.actionValue || 'COMMERCIAL',
            stage: 'todo',
            notes: `Auto-adicionado via regra ${rule.name}`
          }
        });

      case 'NOTIFY_TEAM':
        // TODO: Implementar notificação
        console.log(`📢 Notificação para team: ${rule.actionValue}`);
        break;

      case 'MARK_FOR_REVIEW':
        return await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: 'CONSULTING',
            activities: {
              create: {
                userId: 'system', // Usar ID de sistema
                action: 'marked_for_review',
                details: JSON.stringify({
                  reason: rule.actionValue,
                  rule: rule.name
                })
              }
            }
          }
        });

      default:
        throw new Error(`Ação desconhecida: ${rule.action}`);
    }
  }

  /**
   * Valida condição de gatilho
   */
  private validateTriggerCondition(lead: any, trigger: string, value: string): boolean {
    switch (trigger) {
      case 'LEAD_SCORE_ABOVE':
        return lead.score >= parseInt(value);

      case 'LEAD_SCORE_BELOW':
        return lead.score <= parseInt(value);

      case 'CATEGORY_MATCH':
        return lead.category === value;

      case 'STATUS_CHANGE':
        return lead.status === value;

      case 'DAYS_WITHOUT_ACTION':
        // Verificar últimas atividades
        return lead.daysWithoutActivity >= parseInt(value);

      default:
        return true;
    }
  }

  /**
   * Executar automações para todos os leads (scheduler)
   */
  async executeScheduledAutomations(): Promise<any> {
    try {
      const leads = await prisma.lead.findMany({
        where: {
          status: {
            notIn: ['CONVERTED', 'LOSS']
          }
        }
      });

      console.log(`⚙️ Processando automações para ${leads.length} leads...`);

      let executed = 0;
      let errors = 0;

      for (const lead of leads) {
        try {
          // Recalcular score
          await leadScoringService.calculateLeadScore(lead.id);

          // Executar automações baseadas em score
          if (lead.score >= 70 && !lead.responsibleId) {
            // Auto-atribuir se score alto
            await autoAssignmentService.autoAssignLead(lead.id);
            executed++;
          } else if (lead.score <= 30 && lead.responsibleId) {
            // Marcar para revisão se score baixo
            await prisma.automationLog.create({
              data: {
                leadId: lead.id,
                action: 'MARK_FOR_REVIEW',
                status: 'EXECUTED',
                details: JSON.stringify({
                  reason: `Score baixo: ${lead.score}/100`
                })
              }
            });
            executed++;
          }
        } catch (error) {
          console.error(`❌ Erro ao processar lead ${lead.id}:`, error);
          errors++;
        }
      }

      console.log(`✅ Automações processadas: ${executed} executadas, ${errors} erros`);

      return {
        processed: leads.length,
        executed,
        errors,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Erro ao executar automações agendadas:', error);
      throw error;
    }
  }

  /**
   * Criar regra de automação
   */
  async createAutomationRule(data: {
    name: string;
    description?: string;
    trigger: AutomationTrigger;
    triggerValue?: string;
    action: AutomationAction;
    actionValue?: string;
    sequenceId?: string;
    priority?: number;
  }): Promise<any> {
    try {
      const rule = await prisma.automationRule.create({
        data: {
          name: data.name,
          description: data.description,
          trigger: data.trigger,
          triggerValue: data.triggerValue,
          action: data.action,
          actionValue: data.actionValue,
          sequenceId: data.sequenceId,
          priority: data.priority || 0,
          isActive: true
        }
      });

      console.log(`✅ Regra de automação criada: ${rule.name}`);
      return rule;
    } catch (error) {
      console.error('❌ Erro ao criar regra:', error);
      throw error;
    }
  }

  /**
   * Listar regras de automação
   */
  async listRules(isActive?: boolean): Promise<any[]> {
    try {
      const rules = await prisma.automationRule.findMany({
        where: isActive !== undefined ? { isActive } : undefined,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          sequence: {
            select: { name: true }
          },
          _count: {
            select: { logs: true }
          }
        }
      });

      return rules;
    } catch (error) {
      console.error('❌ Erro ao listar regras:', error);
      throw error;
    }
  }

  /**
   * Desativar regra
   */
  async disableRule(ruleId: string): Promise<void> {
    try {
      await prisma.automationRule.update({
        where: { id: ruleId },
        data: { isActive: false }
      });

      console.log(`✅ Regra ${ruleId} desativada`);
    } catch (error) {
      console.error('❌ Erro ao desativar regra:', error);
      throw error;
    }
  }

  /**
   * Obter logs de automação
   */
  async getAutomationLogs(leadId?: string, limit: number = 50): Promise<any[]> {
    try {
      const logs = await prisma.automationLog.findMany({
        where: leadId ? { leadId } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          lead: {
            select: { id: true, name: true }
          },
          rule: {
            select: { id: true, name: true }
          }
        }
      });

      return logs;
    } catch (error) {
      console.error('❌ Erro ao obter logs:', error);
      throw error;
    }
  }
}

export const automationEngine = new AutomationEngine();
