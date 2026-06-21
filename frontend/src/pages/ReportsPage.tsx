import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, Button } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import api from '../services/api';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [overviewData, setOverviewData] = useState<any>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      const queryStr = params.toString();

      const [overview, timeSeries] = await Promise.all([
        api.get(`/reports/overview${queryStr ? `?${queryStr}` : ''}`).catch(() => ({ data: { data: null } })),
        api.get('/reports/time-series?days=30').catch(() => ({ data: { data: [] } }))
      ]);

      setOverviewData(overview.data.data);
      setTimeSeriesData(timeSeries.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, subtitle, icon, color }: any) => (
    <Card title={title} icon={icon} hoverable style={{
      borderLeft: `4px solid ${color || designSystem.colors.primary.dark}`
    }}>
      <p style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: designSystem.colors.primary.dark,
        margin: '8px 0'
      }}>
        {value}
      </p>
      {subtitle && (
        <p style={{
          fontSize: '12px',
          color: designSystem.colors.neutral.gray500,
          margin: '4px 0 0 0'
        }}>
          {subtitle}
        </p>
      )}
    </Card>
  );

  const OverviewTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        <KPICard
          title="Total de Leads"
          value={overviewData?.summary?.totalLeads || 0}
          subtitle={`${overviewData?.summary?.convertedLeads || 0} convertidos`}
          icon="👥"
          color={designSystem.colors.primary.dark}
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${overviewData?.summary?.conversionRate || 0}%`}
          subtitle="do período"
          icon="📈"
          color={designSystem.colors.status.success}
        />
        <KPICard
          title="Score Médio"
          value={`${overviewData?.summary?.averageScore || 0}/100`}
          subtitle={`Min: ${overviewData?.summary?.minScore || 0} Max: ${overviewData?.summary?.maxScore || 0}`}
          icon="⭐"
          color={designSystem.colors.accent.gold}
        />
      </div>

      {overviewData?.statusDistribution && (
        <Card title="Distribuição por Status" icon="📊" hoverable>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overviewData.statusDistribution}
                dataKey="_count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {[
                  designSystem.colors.primary.dark,
                  designSystem.colors.status.success,
                  designSystem.colors.accent.gold,
                  designSystem.colors.status.error,
                  designSystem.colors.primary.light
                ].map((color, i) => (
                  <Cell key={`cell-${i}`} fill={color} />
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
        </Card>
      )}
    </div>
  );

  const TimeSeriesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card title="Leads Criados (últimos 30 dias)" icon="📈" hoverable>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
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
            <Line type="monotone" dataKey="leadsCreated" stroke={designSystem.colors.primary.dark} name="Leads Criados" strokeWidth={2} />
            <Line type="monotone" dataKey="converted" stroke={designSystem.colors.status.success} name="Convertidos" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Taxa de Conversão Diária" icon="📊" hoverable>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.neutral.gray300} />
            <XAxis dataKey="date" stroke={designSystem.colors.neutral.gray500} />
            <YAxis stroke={designSystem.colors.neutral.gray500} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="conversionRate" fill={designSystem.colors.accent.gold} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  return (
    <div>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: designSystem.colors.primary.dark,
            margin: '0 0 8px 0'
          }}>
            📊 Relatórios & Analytics
          </h1>
          <p style={{
            color: designSystem.colors.neutral.gray600,
            margin: '0'
          }}>
            Análise completa de leads e conversões
          </p>
        </div>

        <Card title="Filtros" icon="🔍" hoverable style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: designSystem.colors.primary.dark,
                marginBottom: '6px'
              }}>
                Data Inicial
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: designSystem.colors.primary.dark,
                marginBottom: '6px'
              }}>
                Data Final
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <Button variant="secondary">📥 PDF</Button>
              <Button variant="primary">📊 CSV</Button>
            </div>
          </div>
        </Card>

        <div style={{
          backgroundColor: designSystem.colors.neutral.white,
          borderRadius: '12px',
          boxShadow: designSystem.shadows.md,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
            overflowX: 'auto'
          }}>
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'timeseries', label: '📈 Série Temporal' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab.id ? designSystem.colors.primary.dark : 'transparent',
                  color: activeTab === tab.id ? designSystem.colors.neutral.white : designSystem.colors.neutral.gray600,
                  transition: designSystem.transitions.normal
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = designSystem.colors.neutral.light;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: designSystem.colors.neutral.gray500
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                <p>Carregando relatórios...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'timeseries' && <TimeSeriesTab />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
