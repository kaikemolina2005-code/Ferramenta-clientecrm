/**
 * DADOS DE DEMONSTRACAO (apenas para visualizar o layout/graficos).
 *
 * Sao usados SOMENTE quando a API retorna vazio e DEMO_FALLBACK = true.
 * Para desligar antes de ir para producao, mude DEMO_FALLBACK para false
 * (ou remova este arquivo e os usos em DashboardPage/LeadsPage).
 */
import type { Lead } from '@/types';

export const DEMO_FALLBACK = false;

export const demoLeads: Lead[] = [
  {
    id: 'demo-1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 98888-1111',
    cpf: '123.456.789-00',
    whatsappId: '5511988881111',
    city: 'São Paulo',
    state: 'SP',
    category: 'CONSULTATION',
    status: 'CONVERTED',
    source: 'WHATSAPP',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    name: 'João Pereira',
    email: 'joao.pereira@email.com',
    phone: '(11) 97777-2222',
    cpf: '987.654.321-00',
    whatsappId: '5511977772222',
    city: 'Campinas',
    state: 'SP',
    category: 'PROCESS',
    status: 'CONSULTING',
    source: 'SITE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Serie temporal de exemplo (ultimos 14 dias)
function buildTimeSeries() {
  const days = 14;
  const out: { date: string; leadsCreated: number; converted: number }[] = [];
  const sampleLeads = [0, 1, 0, 2, 1, 1, 0, 2, 3, 1, 0, 1, 2, 1];
  const sampleConv = [0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({
      date: label,
      leadsCreated: sampleLeads[days - 1 - i] ?? 0,
      converted: sampleConv[days - 1 - i] ?? 0,
    });
  }
  return out;
}

export const demoDashboard = {
  overview: {
    summary: {
      totalLeads: 2,
      convertedLeads: 1,
      conversionRate: 50,
      activeProcesses: 1,
    },
  },
  leadAnalytics: {
    leadsBySource: [
      { source: 'WHATSAPP', _count: 1 },
      { source: 'SITE', _count: 1 },
    ],
  },
  conversionMetrics: {
    topPerformers: [
      { userName: 'Dra. Ana', converted: 1, rate: 50 },
      { userName: 'Dr. Carlos', converted: 0, rate: 0 },
    ],
  },
  timeSeries: buildTimeSeries(),
};
