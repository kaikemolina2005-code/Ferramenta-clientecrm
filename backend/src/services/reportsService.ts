import { PrismaClient } from '@prisma/client';

import { prisma } from './prisma.js';

export class ReportsService {
  /**
   * Overview com KPIs principais
   */
  async getOverview(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
    const end = endDate || new Date();

    try {
      // Executa todas as consultas em paralelo (muito mais rápido que em série)
      const [totalLeads, convertedLeads, scoreStats, leadsByStatus, leadsByCategory, activeProcesses] = await Promise.all([
        // Total de leads no período
        prisma.lead.count({
          where: { createdAt: { gte: start, lte: end } }
        }),
        // Leads convertidos
        prisma.lead.count({
          where: {
            status: 'CONVERTED',
            createdAt: { gte: start, lte: end }
          }
        }),
        // Score médio
        prisma.lead.aggregate({
          _avg: { score: true },
          _max: { score: true },
          _min: { score: true }
        }),
        // Leads por status
        prisma.lead.groupBy({
          by: ['status'],
          _count: true,
          where: { createdAt: { gte: start, lte: end } }
        }),
        // Leads por categoria
        prisma.lead.groupBy({
          by: ['category'],
          _count: true,
          where: { createdAt: { gte: start, lte: end } }
        }),
        // Processos ativos (ainda em andamento, não convertidos nem perdidos)
        prisma.lead.count({
          where: {
            status: { in: ['INITIAL', 'CONSULTING', 'PAYMENT'] }
          }
        })
      ]);

      // Taxa de conversão
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      return {
        period: { start, end },
        summary: {
          totalLeads,
          convertedLeads,
          conversionRate: Math.round(conversionRate * 10) / 10,
          averageScore: Math.round((scoreStats._avg.score || 0) * 10) / 10,
          maxScore: scoreStats._max.score || 0,
          minScore: scoreStats._min.score || 0,
          activeProcesses
        },
        statusDistribution: leadsByStatus,
        categoryDistribution: leadsByCategory
      };
    } catch (error) {
      console.error('❌ Erro ao gerar overview:', error);
      throw error;
    }
  }

  /**
   * Análise detalhada de leads
   */
  async getLeadAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    try {
      // Executa todas as consultas em paralelo
      const [leadsBySource, leadsByUser, highScoreLeads, lowScoreLeads, allLeads] = await Promise.all([
        // Leads por fonte
        prisma.lead.groupBy({
          by: ['source'],
          _count: true,
          where: { createdAt: { gte: start, lte: end } }
        }),
        // Leads por responsável
        prisma.lead.groupBy({
          by: ['responsibleId'],
          _count: true,
          where: { createdAt: { gte: start, lte: end } }
        }),
        // Leads com scores altos vs baixos
        prisma.lead.count({
          where: { score: { gte: 70 }, createdAt: { gte: start, lte: end } }
        }),
        prisma.lead.count({
          where: { score: { lt: 40 }, createdAt: { gte: start, lte: end } }
        }),
        // Tempo médio no pipeline
        prisma.lead.findMany({
          where: { createdAt: { gte: start, lte: end } },
          select: { createdAt: true, updatedAt: true },
          take: 1000
        })
      ]);

      const avgDaysInPipeline = allLeads.length > 0
        ? allLeads.reduce((sum, lead) => {
            const days = (lead.updatedAt.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / allLeads.length
        : 0;

      return {
        period: { start, end },
        leadsBySource,
        leadsByUser,
        scoreDistribution: {
          high: highScoreLeads,
          low: lowScoreLeads
        },
        avgDaysInPipeline: Math.round(avgDaysInPipeline)
      };
    } catch (error) {
      console.error('❌ Erro ao gerar lead analytics:', error);
      throw error;
    }
  }

  /**
   * Métricas de conversão
   */
  async getConversionMetrics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 dias
    const end = endDate || new Date();

    try {
      // Executa todas as consultas em paralelo
      const [conversionByCategory, allLeadsByUser, convertedByUser] = await Promise.all([
        // Conversões por categoria
        prisma.lead.groupBy({
          by: ['category'],
          _count: { id: true },
          where: {
            status: 'CONVERTED',
            createdAt: { gte: start, lte: end }
          }
        }),
        // Taxa de conversão por responsável
        prisma.lead.groupBy({
          by: ['responsibleId'],
          _count: { id: true },
          where: { createdAt: { gte: start, lte: end } }
        }),
        prisma.lead.groupBy({
          by: ['responsibleId'],
          _count: { id: true },
          where: {
            status: 'CONVERTED',
            createdAt: { gte: start, lte: end }
          }
        })
      ]);

      // Top performers
      const topPerformersRaw = convertedByUser
        .map(item => {
          const total = allLeadsByUser.find(u => u.responsibleId === item.responsibleId)?._count.id || 1;
          return {
            userId: item.responsibleId,
            converted: item._count.id,
            total,
            rate: Math.round((item._count.id / total) * 100)
          };
        })
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5);

      // Resolver nomes dos responsáveis
      const userIds = topPerformersRaw.map(p => p.userId).filter((id): id is string => !!id);
      const users = userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true }
          })
        : [];

      const topPerformers = topPerformersRaw.map(p => ({
        ...p,
        userName: users.find(u => u.id === p.userId)?.name || 'Sem responsável'
      }));

      return {
        period: { start, end },
        conversionByCategory,
        topPerformers
      };
    } catch (error) {
      console.error('❌ Erro ao gerar conversion metrics:', error);
      throw error;
    }
  }

  /**
   * Relatórios de automação
   */
  async getAutomationReports(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    try {
      // Executa todas as consultas em paralelo
      const [totalAutomations, automationsByStatus, automationsByAction, topRules] = await Promise.all([
        // Total de automações executadas
        prisma.automationLog.count({
          where: { createdAt: { gte: start, lte: end } }
        }),
        // Automações por status
        (prisma.automationLog.groupBy as any)({
          by: ['status'],
          _count: true,
          where: { createdAt: { gte: start, lte: end } }
        }) as Promise<any[]>,
        // Automações por action
        (prisma.automationLog.groupBy as any)({
          by: ['action'],
          _count: true,
          where: { createdAt: { gte: start, lte: end } }
        }) as Promise<any[]>,
        // Top regras mais usadas
        (prisma.automationLog.groupBy as any)({
          by: ['ruleId'],
          _count: { ruleId: true },
          where: { createdAt: { gte: start, lte: end } },
          orderBy: { _count: { ruleId: 'desc' } },
          take: 5
        })
      ]);

      // Taxa de sucesso
      const successful = automationsByStatus.find((s: any) => s.status === 'EXECUTED')?._count || 0;
      const failed = automationsByStatus.find((s: any) => s.status === 'FAILED')?._count || 0;
      const successRate = totalAutomations > 0 ? (successful / totalAutomations) * 100 : 0;

      return {
        period: { start, end },
        summary: {
          totalAutomations,
          successful,
          failed,
          successRate: Math.round(successRate * 10) / 10
        },
        byStatus: automationsByStatus,
        byAction: automationsByAction,
        topRules
      };
    } catch (error) {
      console.error('❌ Erro ao gerar automation reports:', error);
      throw error;
    }
  }

  /**
   * Dados para gráficos de série temporal
   */
  async getTimeSeriesData(days: number = 30) {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      const [leads, automations] = await Promise.all([
        prisma.lead.findMany({
          where: { createdAt: { gte: startDate } },
          select: { createdAt: true, status: true, score: true }
        }),
        prisma.automationLog.findMany({
          where: { createdAt: { gte: startDate } },
          select: { createdAt: true }
        })
      ]);

      const data = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayLeads = leads.filter(l => l.createdAt >= date && l.createdAt < nextDate);
        const converted = dayLeads.filter(l => l.status === 'CONVERTED').length;
        const automationExecutions = automations.filter(a => a.createdAt >= date && a.createdAt < nextDate).length;
        const avgScore = dayLeads.length > 0
          ? dayLeads.reduce((sum, l) => sum + l.score, 0) / dayLeads.length
          : 0;

        data.push({
          date: date.toISOString().split('T')[0],
          leadsCreated: dayLeads.length,
          converted,
          conversionRate: dayLeads.length > 0 ? Math.round((converted / dayLeads.length) * 100) : 0,
          automationExecutions,
          avgScore: Math.round(avgScore * 10) / 10
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao gerar time series data:', error);
      throw error;
    }
  }

  /**
   * Comparação período vs período anterior
   */
  async getPeriodComparison(days: number = 30) {
    try {
      const today = new Date();
      const currentStart = new Date(today);
      currentStart.setDate(currentStart.getDate() - days);

      const previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - days);

      // Executa as 4 contagens em paralelo
      const [currentLeads, currentConverted, previousLeads, previousConverted] = await Promise.all([
        // Current period
        prisma.lead.count({
          where: { createdAt: { gte: currentStart, lte: today } }
        }),
        prisma.lead.count({
          where: {
            status: 'CONVERTED',
            createdAt: { gte: currentStart, lte: today }
          }
        }),
        // Previous period
        prisma.lead.count({
          where: { createdAt: { gte: previousStart, lt: currentStart } }
        }),
        prisma.lead.count({
          where: {
            status: 'CONVERTED',
            createdAt: { gte: previousStart, lt: currentStart }
          }
        })
      ]);

      const leadsGrowth = previousLeads > 0 ? Math.round(((currentLeads - previousLeads) / previousLeads) * 100) : 0;
      const conversionGrowth = previousConverted > 0
        ? Math.round((((currentConverted / currentLeads) - (previousConverted / previousLeads)) / (previousConverted / previousLeads)) * 100)
        : 0;

      return {
        currentPeriod: { start: currentStart, end: today, leads: currentLeads, converted: currentConverted },
        previousPeriod: { start: previousStart, end: currentStart, leads: previousLeads, converted: previousConverted },
        growth: {
          leadsPercentage: leadsGrowth,
          conversionPercentage: conversionGrowth
        }
      };
    } catch (error) {
      console.error('❌ Erro ao comparar períodos:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService();
