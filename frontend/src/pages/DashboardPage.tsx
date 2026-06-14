import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Card } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import api from '@/services/api';

const AD_SPEND_STORAGE_KEY = 'dashboard_ad_spend';

const SOURCE_LABELS: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  SITE: 'Site',
  REFERRAL: 'Indicação',
  MANUAL: 'Manual',
};

const PIE_COLORS = [
  designSystem.colors.primary.dark,
  designSystem.colors.primary.light,
  designSystem.colors.accent.gold,
  designSystem.colors.status.success,
  designSystem.colors.status.error,
];

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [leadAnalytics, setLeadAnalytics] = useState<any>(null);
  const [conversionMetrics, setConversionMetrics] = useState<any>(null);
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [adSpend, setAdSpend] = useState<string>(() => localStorage.getItem(AD_SPEND_STORAGE_KEY) || '');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [overviewRes, leadAnalyticsRes, conversionRes, timeSeriesRes] = await Promise.all([
        api.get('/reports/overview').catch(() => ({ data: { data: null } })),
        api.get('/reports/leads-analytics').catch(() => ({ data: { data: null } })),
        api.get('/reports/conversion-metrics').catch(() => ({ data: { data: null } })),
        api.get('/reports/time-series?days=30').catch(() => ({ data: { data: [] } })),
      ]);

      setOverview(overviewRes.data.data);
      setLeadAnalytics(leadAnalyticsRes.data.data);
      setConversionMetrics(conversionRes.data.data);
      setTimeSeries(timeSeriesRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdSpendChange = (value: string) => {
    setAdSpend(value);
    localStorage.setItem(AD_SPEND_STORAGE_KEY, value);
  };

  const totalLeads = overview?.summary?.totalLeads || 0;
  const convertedLeads = overview?.summary?.convertedLeads || 0;
  const conversionRate = overview?.summary?.conversionRate || 0;
  const activeProcesses = overview?.summary?.activeProcesses || 0;

  const adSpendValue = parseFloat(adSpend);
  const cpc = !isNaN(adSpendValue) && totalLeads > 0 ? adSpendValue / totalLeads : null;

  const originData = (leadAnalytics?.leadsBySource || [])
    .filter((item: any) => item.source)
    .map((item: any) => ({
      name: SOURCE_LABELS[item.source] || item.source,
      value: item._count,
    }));

  const topPerformers = conversionMetrics?.topPerformers || [];

  const metrics = [
    { label: 'Leads Recebidos', value: `${totalLeads}`, icon: '👥' },
    { label: 'Clientes Convertidos', value: `${convertedLeads}`, icon: '✅' },
    { label: 'Taxa de Conversão', value: `${conversionRate}%`, icon: '📊' },
    { label: 'Processos Ativos', value: `${activeProcesses}`, icon: '⚙️' },
    { label: 'CPC (Custo por Contato)', value: cpc !== null ? `R$ ${cpc.toFixed(2)}` : '—', icon: '💰' },
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: designSystem.colors.neutral.light
      }}>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${designSystem.colors.primary.light}`,
            borderTop: `4px solid ${designSystem.colors.primary.dark}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: designSystem.colors.primary.dark, fontWeight: '600' }}>
            Carregando Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px',
      backgroundColor: designSystem.colors.neutral.light,
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: designSystem.colors.primary.dark,
        marginBottom: '32px',
        fontFamily: 'Segoe UI, sans-serif'
      }}>
        📊 Dashboard
      </h1>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {metrics.map((metric, idx) => (
          <Card key={idx} title={metric.label} icon={metric.icon} hoverable>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <p style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: designSystem.colors.primary.dark
              }}>
                {metric.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* CPC input */}
      <Card title="Configurar CPC" icon="💰" hoverable style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '13px', color: designSystem.colors.neutral.gray600 }}>
            Investimento total em anúncios (R$):
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={adSpend}
            onChange={(e) => handleAdSpendChange(e.target.value)}
            placeholder="Ex: 1500.00"
            style={{
              padding: '8px 12px',
              border: `1px solid ${designSystem.colors.neutral.gray300}`,
              borderRadius: '6px',
              fontSize: '13px',
              width: '160px'
            }}
          />
          <span style={{ fontSize: '12px', color: designSystem.colors.neutral.gray500 }}>
            O CPC é calculado dividindo esse valor pelo total de leads recebidos.
          </span>
        </div>
      </Card>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {/* Leads vs Conversions Chart */}
        <Card title="Leads x Conversões (30 dias)" icon="📈" hoverable style={{ gridColumn: '1 / -1' }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.neutral.gray300} />
              <XAxis dataKey="date" stroke={designSystem.colors.neutral.gray500} />
              <YAxis stroke={designSystem.colors.neutral.gray500} />
              <Tooltip
                contentStyle={{
                  backgroundColor: designSystem.colors.neutral.white,
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="leadsCreated" name="Leads" stroke={designSystem.colors.primary.dark} strokeWidth={2} dot={{ fill: designSystem.colors.primary.dark }} />
              <Line type="monotone" dataKey="converted" name="Conversões" stroke={designSystem.colors.accent.gold} strokeWidth={2} dot={{ fill: designSystem.colors.accent.gold }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Origin Chart */}
        <Card title="Origem dos Leads" icon="🌍" hoverable>
          {originData.length === 0 ? (
            <p style={{ textAlign: 'center', color: designSystem.colors.neutral.gray500, padding: '48px 0' }}>
              Sem dados de origem disponíveis ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={originData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {originData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: designSystem.colors.neutral.white,
                    border: `1px solid ${designSystem.colors.neutral.gray300}`,
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Conversion by Responsible */}
        <Card title="Conversão por Responsável" icon="🏆" hoverable>
          {topPerformers.length === 0 ? (
            <p style={{ textAlign: 'center', color: designSystem.colors.neutral.gray500, padding: '48px 0' }}>
              Sem conversões registradas no período.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformers}>
                <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.neutral.gray300} />
                <XAxis dataKey="userName" stroke={designSystem.colors.neutral.gray500} />
                <YAxis stroke={designSystem.colors.neutral.gray500} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: designSystem.colors.neutral.white,
                    border: `1px solid ${designSystem.colors.neutral.gray300}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="converted" name="Convertidos" fill={designSystem.colors.primary.dark} radius={[8, 8, 0, 0]} />
                <Bar dataKey="rate" name="Taxa (%)" fill={designSystem.colors.accent.gold} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
