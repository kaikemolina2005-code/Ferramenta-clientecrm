import { PrismaClient } from '@prisma/client';

import { prisma } from './prisma.js';

interface ScoringFactors {
  baseScore: number;
  categoryScore: number;
  sourceScore: number;
  statusScore: number;
  documentScore: number;
  activityScore: number;
  emailScore: number;
  conversionScore: number;
  recencyScore: number;
  totalScore: number;
}

class LeadScoringService {
  /**
   * Calcula score de um lead baseado em múltiplos fatores
   */
  async calculateLeadScore(leadId: string): Promise<{ score: number; factors: ScoringFactors }> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          documents: true,
          activities: true,
          emailLogs: true,
          conversions: true,
          kanbanCards: true
        }
      });

      if (!lead) {
        throw new Error('Lead não encontrado');
      }

      let factors: ScoringFactors = {
        baseScore: 10,
        categoryScore: 0,
        sourceScore: 0,
        statusScore: 0,
        documentScore: 0,
        activityScore: 0,
        emailScore: 0,
        conversionScore: 0,
        recencyScore: 0,
        totalScore: 0
      };

      // ═══ 1. PONTUAÇÃO POR CATEGORIA ═══
      // Algumas categorias são mais valiosas que outras
      switch (lead.category) {
        case 'RETIREMENT':
          factors.categoryScore = 25; // Alta prioridade
          break;
        case 'BPC_LOAS':
          factors.categoryScore = 20;
          break;
        case 'PROCESS':
          factors.categoryScore = 15;
          break;
        case 'CONSULTATION':
          factors.categoryScore = 10;
          break;
        default:
          factors.categoryScore = 5;
      }

      // ═══ 2. PONTUAÇÃO POR FONTE ═══
      // Diferentes fontes têm taxas de conversão diferentes
      if (lead.source) {
        const sourceScores: { [key: string]: number } = {
          'WEBHOOK': 20,
          'WHATSAPP': 18,
          'WEBSITE': 15,
          'REFERRAL': 15,
          'PHONE': 10,
          'EMAIL': 8,
          'DIRECT': 5
        };
        factors.sourceScore = sourceScores[lead.source] || 5;
      }

      // ═══ 3. PONTUAÇÃO POR STATUS ═══
      // Leads em estágios avançados têm score maior
      const statusScores: { [key: string]: number } = {
        'CONVERTED': 35,
        'PAYMENT': 28,
        'CONSULTING': 20,
        'INITIAL': 10,
        'LOSS': 0
      };
      factors.statusScore = statusScores[lead.status] || 0;

      // ═══ 4. PONTUAÇÃO POR DOCUMENTOS ═══
      // Cada documento enviado aumenta o score
      if (lead.documents && lead.documents.length > 0) {
        factors.documentScore = Math.min(lead.documents.length * 5, 20);
      }

      // ═══ 5. PONTUAÇÃO POR ATIVIDADE ═══
      // Atividade recente aumenta o score
      if (lead.activities && lead.activities.length > 0) {
        factors.activityScore = Math.min(lead.activities.length * 3, 15);
      }

      // ═══ 6. PONTUAÇÃO POR EMAILS ═══
      // Emails abertos/clicados aumentam o score
      let openedEmails = 0;
      let clickedEmails = 0;

      if (lead.emailLogs && lead.emailLogs.length > 0) {
        openedEmails = lead.emailLogs.filter(e => e.openedAt).length;
        clickedEmails = lead.emailLogs.filter(e => e.clickedAt).length;
        
        factors.emailScore = (openedEmails * 2) + (clickedEmails * 3);
        factors.emailScore = Math.min(factors.emailScore, 15);
      }

      // ═══ 7. PONTUAÇÃO POR CONVERSÃO ═══
      // Conversões confirmadas = score máximo
      if (lead.conversions && lead.conversions.length > 0) {
        factors.conversionScore = 30;
      }

      // ═══ 8. PONTUAÇÃO POR RECÊNCIA ═══
      // Leads recentes têm score maior
      const createdDate = new Date(lead.createdAt);
      const daysOld = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOld <= 1) {
        factors.recencyScore = 10; // Novo!
      } else if (daysOld <= 7) {
        factors.recencyScore = 8;
      } else if (daysOld <= 30) {
        factors.recencyScore = 5;
      } else if (daysOld <= 90) {
        factors.recencyScore = 2;
      } else {
        factors.recencyScore = 0;
      }

      // ═══ CALCULAR SCORE TOTAL ═══
      factors.totalScore = Math.min(
        factors.baseScore +
        factors.categoryScore +
        factors.sourceScore +
        factors.statusScore +
        factors.documentScore +
        factors.activityScore +
        factors.emailScore +
        factors.conversionScore +
        factors.recencyScore,
        100
      );

      // Salvar score no banco
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          score: factors.totalScore,
          scoreUpdatedAt: new Date(),
          scoringFactors: JSON.stringify(factors)
        }
      });

      console.log(`✅ Score calculado para lead ${lead.name}: ${factors.totalScore}/100`);

      return {
        score: factors.totalScore,
        factors
      };
    } catch (error) {
      console.error('❌ Erro ao calcular score:', error);
      throw error;
    }
  }

  /**
   * Recalcula scores de todos os leads
   */
  async recalculateAllScores(): Promise<number> {
    try {
      const leads = await prisma.lead.findMany({
        select: { id: true }
      });

      let updated = 0;
      for (const lead of leads) {
        try {
          await this.calculateLeadScore(lead.id);
          updated++;
        } catch (error) {
          console.warn(`⚠️ Erro ao calcular score para lead ${lead.id}`);
        }
      }

      console.log(`✅ Scores recalculados: ${updated}/${leads.length} leads`);
      return updated;
    } catch (error) {
      console.error('❌ Erro ao recalcular scores:', error);
      throw error;
    }
  }

  /**
   * Obtém leads com score acima de um limiar (high-quality leads)
   */
  async getHighQualityLeads(minScore: number = 70): Promise<any[]> {
    try {
      const leads = await prisma.lead.findMany({
        where: {
          score: {
            gte: minScore
          }
        },
        orderBy: {
          score: 'desc'
        },
        include: {
          responsible: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return leads;
    } catch (error) {
      console.error('❌ Erro ao obter high-quality leads:', error);
      throw error;
    }
  }

  /**
   * Obtém leads com score baixo (que precisam de follow-up)
   */
  async getLowScoreLeads(maxScore: number = 30): Promise<any[]> {
    try {
      const leads = await prisma.lead.findMany({
        where: {
          score: {
            lte: maxScore
          },
          status: {
            notIn: ['CONVERTED', 'LOSS']
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          activities: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      return leads;
    } catch (error) {
      console.error('❌ Erro ao obter low-score leads:', error);
      throw error;
    }
  }

  /**
   * Obtém distribuição de scores (para analytics)
   */
  async getScoreDistribution(): Promise<any> {
    try {
      // Contar leads por faixa de score
      const excellent = await prisma.lead.count({ where: { score: { gte: 80 } } });
      const good = await prisma.lead.count({ where: { score: { gte: 60, lt: 80 } } });
      const medium = await prisma.lead.count({ where: { score: { gte: 40, lt: 60 } } });
      const poor = await prisma.lead.count({ where: { score: { lt: 40 } } });
      const total = excellent + good + medium + poor;

      // Calcular média usando aggregate
      const aggregateResult = await prisma.lead.aggregate({
        _avg: { score: true }
      });

      const average = aggregateResult._avg.score || 0;

      return {
        excellent,
        good,
        medium,
        poor,
        average: Math.round(average * 10) / 10,
        total
      };
    } catch (error) {
      console.error('❌ Erro ao obter distribuição de scores:', error);
      throw error;
    }
  }

  /**
   * Obter fatores de score de um lead
   */
  async getLeadScoringDetails(leadId: string): Promise<ScoringFactors | null> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { scoringFactors: true, score: true }
      });

      if (!lead || !lead.scoringFactors) {
        return null;
      }

      return JSON.parse(lead.scoringFactors);
    } catch (error) {
      console.error('❌ Erro ao obter detalhes de score:', error);
      return null;
    }
  }

  /**
   * Boost no score (para leads específicos)
   */
  async boostLeadScore(leadId: string, boostPoints: number, reason: string): Promise<number> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId }
      });

      if (!lead) {
        throw new Error('Lead não encontrado');
      }

      const newScore = Math.min(lead.score + boostPoints, 100);

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          score: newScore,
          scoreUpdatedAt: new Date()
        }
      });

      console.log(`⭐ Lead ${leadId} boosted: ${lead.score} → ${newScore} (${reason})`);

      return newScore;
    } catch (error) {
      console.error('❌ Erro ao fazer boost no score:', error);
      throw error;
    }
  }
}

export const leadScoringService = new LeadScoringService();
