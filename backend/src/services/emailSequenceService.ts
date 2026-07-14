import { PrismaClient } from '@prisma/client';
import { emailService } from './emailService.js';
import { 
  SequenceTrigger, 
  SequenceStatus, 
  EmailStatus,
  LeadCategory 
} from '@prisma/client';

import { prisma } from './prisma.js';

interface SequenceStep {
  stepNumber: number;
  delayMinutes: number;
  template: string;
  subject: string;
  previewText?: string;
}

interface CreateSequenceInput {
  name: string;
  description?: string;
  trigger: SequenceTrigger;
  triggerValue?: string;
  isActive?: boolean;
  priority?: number;
  steps: SequenceStep[];
  maxRetries?: number;
  retryDelayMin?: number;
}

class EmailSequenceService {
  /**
   * Cria uma nova sequência de email
   */
  async createSequence(input: CreateSequenceInput) {
    try {
      const sequence = await prisma.emailSequence.create({
        data: {
          name: input.name,
          description: input.description,
          trigger: input.trigger,
          triggerValue: input.triggerValue,
          isActive: input.isActive ?? true,
          priority: input.priority ?? 0,
          maxRetries: input.maxRetries ?? 3,
          retryDelayMin: input.retryDelayMin ?? 60,
          steps: {
            create: input.steps.map(step => ({
              stepNumber: step.stepNumber,
              delayMinutes: step.delayMinutes,
              template: step.template,
              subject: step.subject,
              previewText: step.previewText,
            }))
          }
        },
        include: {
          steps: true
        }
      });

      console.log(`✅ Sequência criada: ${sequence.name} (ID: ${sequence.id})`);
      return sequence;
    } catch (error) {
      console.error('❌ Erro ao criar sequência:', error);
      throw error;
    }
  }

  /**
   * Dispara uma sequência para um lead
   */
  async triggerSequence(leadId: string, trigger: SequenceTrigger, category?: LeadCategory) {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId }
      });

      if (!lead || !lead.email) {
        console.warn(`⚠️ Lead ${leadId} não possui email`);
        return null;
      }

      // Encontra sequências ativas que correspondem ao gatilho
      const matchingSequences = await prisma.emailSequence.findMany({
        where: {
          isActive: true,
          trigger: trigger,
          // Se houver triggerValue específico, validar
          OR: [
            { triggerValue: null },
            { triggerValue: category }
          ]
        },
        include: {
          steps: {
            orderBy: { stepNumber: 'asc' }
          }
        }
      });

      if (matchingSequences.length === 0) {
        console.log(`ℹ️ Nenhuma sequência encontrada para gatilho: ${trigger}`);
        return null;
      }

      // Ordena por prioridade
      matchingSequences.sort((a, b) => b.priority - a.priority);
      const sequence = matchingSequences[0];

      // Verifica se lead já está em progresso com esta sequência
      const existingProgress = await prisma.leadSequenceProgress.findUnique({
        where: {
          leadId_sequenceId: {
            leadId,
            sequenceId: sequence.id
          }
        }
      });

      if (existingProgress) {
        console.log(`ℹ️ Lead ${leadId} já está em progresso com sequência ${sequence.id}`);
        return existingProgress;
      }

      // Cria novo progresso
      const progress = await prisma.leadSequenceProgress.create({
        data: {
          leadId,
          sequenceId: sequence.id,
          currentStep: 0,
          status: SequenceStatus.ACTIVE,
          nextStepAt: this.calculateNextStep(sequence.steps[0]?.delayMinutes ?? 0)
        }
      });

      console.log(`✅ Sequência disparada para lead ${leadId}: ${sequence.name}`);
      
      // Agenda o envio do primeiro email
      if (sequence.steps.length > 0) {
        this.scheduleNextEmail(leadId, sequence.id);
      }

      return progress;
    } catch (error) {
      console.error('❌ Erro ao disparar sequência:', error);
      throw error;
    }
  }

  /**
   * Processa emails agendados (chamado pelo scheduler)
   */
  async processScheduledEmails() {
    try {
      const now = new Date();

      // Encontra todos os progressos que têm próximo email agendado
      const dueProgressions = await prisma.leadSequenceProgress.findMany({
        where: {
          status: SequenceStatus.ACTIVE,
          nextStepAt: {
            lte: now
          }
        },
        include: {
          lead: true,
          sequence: {
            include: {
              steps: {
                orderBy: { stepNumber: 'asc' }
              }
            }
          }
        }
      });

      console.log(`📧 Processando ${dueProgressions.length} emails agendados...`);

      for (const progress of dueProgressions) {
        await this.sendSequenceEmail(progress);
      }

      return dueProgressions.length;
    } catch (error) {
      console.error('❌ Erro ao processar emails agendados:', error);
      throw error;
    }
  }

  /**
   * Envia um email da sequência
   */
  private async sendSequenceEmail(progress: any) {
    try {
      const { lead, sequence, currentStep } = progress;

      if (!lead.email) {
        console.warn(`⚠️ Lead sem email: ${lead.id}`);
        return;
      }

      const step = sequence.steps[currentStep];
      if (!step) {
        console.warn(`⚠️ Passo não encontrado: ${currentStep}`);
        return;
      }

      // Envia email
      const templateData = {
        name: lead.name,
        email: lead.email,
        category: lead.category,
        leadId: lead.id
      };

      await emailService.sendEmail(lead.email, {
        subject: step.subject,
        html: `<p>Olá ${templateData.name},</p><p>${step.subject}</p>`,
        text: `Olá ${templateData.name}, ${step.subject}`,
      });

      // Log do envio
      const emailLog = await prisma.emailLog.create({
        data: {
          sequenceId: sequence.id,
          leadId: lead.id,
          stepNumber: currentStep + 1,
          toEmail: lead.email,
          subject: step.subject,
          status: EmailStatus.SENT,
          sentAt: new Date()
        }
      });

      // Atualiza progresso
      const nextStep = currentStep + 1;
      const isLastStep = nextStep >= sequence.steps.length;
      const nextStepDelay = isLastStep ? null : sequence.steps[nextStep]?.delayMinutes ?? 0;

      await prisma.leadSequenceProgress.update({
        where: { id: progress.id },
        data: {
          currentStep: nextStep,
          lastStepAt: new Date(),
          nextStepAt: isLastStep ? null : this.calculateNextStep(nextStepDelay),
          status: isLastStep ? SequenceStatus.COMPLETED : SequenceStatus.ACTIVE,
          completedAt: isLastStep ? new Date() : null,
          errorCount: 0
        }
      });

      console.log(`✅ Email enviado [${step.template}] para ${lead.email}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar email de sequência:`, error);
      
      // Registra erro
      await prisma.leadSequenceProgress.update({
        where: { id: progress.id },
        data: {
          errorCount: {
            increment: 1
          },
          lastError: (error as any).message,
          status: 
            progress.errorCount >= progress.sequence.maxRetries 
              ? SequenceStatus.ERROR 
              : SequenceStatus.ACTIVE
        }
      });
    }
  }

  /**
   * Agenda o próximo email
   */
  private async scheduleNextEmail(leadId: string, sequenceId: string) {
    const progress = await prisma.leadSequenceProgress.findUnique({
      where: {
        leadId_sequenceId: {
          leadId,
          sequenceId
        }
      },
      include: {
        sequence: {
          include: {
            steps: {
              orderBy: { stepNumber: 'asc' }
            }
          }
        }
      }
    });

    if (!progress || progress.status !== SequenceStatus.ACTIVE) {
      return;
    }

    const nextStepIndex = progress.currentStep;
    const nextStep = progress.sequence.steps[nextStepIndex];

    if (nextStep) {
      const nextStepAt = this.calculateNextStep(nextStep.delayMinutes);
      
      await prisma.leadSequenceProgress.update({
        where: { id: progress.id },
        data: { nextStepAt }
      });

      console.log(`📅 Próximo email agendado para lead ${leadId} em ${nextStepAt}`);
    }
  }

  /**
   * Lista todas as sequências
   */
  async listSequences(isActive?: boolean) {
    try {
      const sequences = await prisma.emailSequence.findMany({
        where: isActive !== undefined ? { isActive } : undefined,
        include: {
          steps: {
            orderBy: { stepNumber: 'asc' }
          },
          _count: {
            select: {
              progress: true,
              emailLogs: true
            }
          }
        }
      });

      return sequences;
    } catch (error) {
      console.error('❌ Erro ao listar sequências:', error);
      throw error;
    }
  }

  /**
   * Obtém progresso de uma sequência
   */
  async getSequenceProgress(sequenceId: string) {
    try {
      const progress = await prisma.leadSequenceProgress.findMany({
        where: { sequenceId },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              category: true
            }
          }
        }
      });

      // Estatísticas
      const stats = {
        total: progress.length,
        active: progress.filter(p => p.status === SequenceStatus.ACTIVE).length,
        completed: progress.filter(p => p.status === SequenceStatus.COMPLETED).length,
        paused: progress.filter(p => p.status === SequenceStatus.PAUSED).length,
        error: progress.filter(p => p.status === SequenceStatus.ERROR).length
      };

      return { progress, stats };
    } catch (error) {
      console.error('❌ Erro ao obter progresso:', error);
      throw error;
    }
  }

  /**
   * Pausa uma sequência para um lead
   */
  async pauseSequence(leadId: string, sequenceId: string) {
    try {
      const updated = await prisma.leadSequenceProgress.update({
        where: {
          leadId_sequenceId: {
            leadId,
            sequenceId
          }
        },
        data: {
          status: SequenceStatus.PAUSED
        }
      });

      console.log(`⏸️  Sequência pausada para lead ${leadId}`);
      return updated;
    } catch (error) {
      console.error('❌ Erro ao pausar sequência:', error);
      throw error;
    }
  }

  /**
   * Retoma uma sequência
   */
  async resumeSequence(leadId: string, sequenceId: string) {
    try {
      const progress = await prisma.leadSequenceProgress.findUnique({
        where: {
          leadId_sequenceId: {
            leadId,
            sequenceId
          }
        }
      });

      if (!progress) {
        throw new Error('Progresso não encontrado');
      }

      const updated = await prisma.leadSequenceProgress.update({
        where: { id: progress.id },
        data: {
          status: SequenceStatus.ACTIVE,
          nextStepAt: new Date() // Envia imediatamente
        }
      });

      console.log(`▶️  Sequência retomada para lead ${leadId}`);
      return updated;
    } catch (error) {
      console.error('❌ Erro ao retomar sequência:', error);
      throw error;
    }
  }

  /**
   * Calcula o próximo horário de envio
   */
  private calculateNextStep(delayMinutes: number): Date {
    const nextDate = new Date();
    nextDate.setMinutes(nextDate.getMinutes() + delayMinutes);
    return nextDate;
  }
}

// Exporta como singleton
export const emailSequenceService = new EmailSequenceService();
