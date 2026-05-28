import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

interface ScoreDistribution {
  excellent: number;
  good: number;
  medium: number;
  poor: number;
  average: number;
  total: number;
}

interface UserWorkload {
  userId: string;
  name: string;
  activeLeads: number;
  maxCapacity: number;
  utilization: number;
  specialties: string[];
  isAvailable: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  priority: number;
}

interface AutomationLog {
  id: string;
  leadId: string;
  trigger: string;
  action: string;
  status: string;
  result?: any;
  createdAt: string;
}

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState('scores');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution | null>(null);
  const [workload, setWorkload] = useState<UserWorkload[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);

  useEffect(() => {
    loadDashboardData();
    // Recarregar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar dados em paralelo
      const [scoresRes, workloadRes, rulesRes, logsRes] = await Promise.all([
        api.get('/automation/leads/scoring/distribution').catch(() => ({ data: { data: null } })),
        api.get('/automation/workload').catch(() => ({ data: { data: [] } })),
        api.get('/automation/rules').catch(() => ({ data: { data: [] } })),
        api.get('/automation/logs?limit=20').catch(() => ({ data: { data: [] } }))
      ]);

      setScoreDistribution(scoresRes.data.data);
      setWorkload(workloadRes.data.data || []);
      setRules(rulesRes.data.data || []);
      setLogs(logsRes.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // KPI CARDS
  // ════════════════════════════════════════════════════════════════

  const KPICard = ({ title, value, subtitle, icon, color }: any) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-4xl opacity-20`}>{icon}</div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════
  // ABA: SCORES
  // ════════════════════════════════════════════════════════════════

  const ScoresTab = () => {
    if (!scoreDistribution) {
      return <div className="text-center py-8">Carregando dados de scores...</div>;
    }

    const chartData = [
      { name: 'Excelente', value: scoreDistribution.excellent, color: '#10b981' },
      { name: 'Bom', value: scoreDistribution.good, color: '#3b82f6' },
      { name: 'Médio', value: scoreDistribution.medium, color: '#f59e0b' },
      { name: 'Baixo', value: scoreDistribution.poor, color: '#ef4444' }
    ];

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            title="Score Médio"
            value={scoreDistribution.average.toFixed(1)}
            subtitle="de 100"
            icon="📊"
            color="blue-500"
          />
          <KPICard
            title="Leads"
            value={scoreDistribution.total}
            subtitle="total no sistema"
            icon="👥"
            color="green-500"
          />
          <KPICard
            title="Excelentes"
            value={scoreDistribution.excellent}
            subtitle="score 80-100"
            icon="⭐"
            color="green-500"
          />
          <KPICard
            title="Críticos"
            value={scoreDistribution.poor}
            subtitle="score < 40"
            icon="⚠️"
            color="red-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Leads por Faixa</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Legenda de Scores</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>Excelente (80-100)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Bom (60-79)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span>Médio (40-59)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Baixo (&lt;40)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // ABA: WORKLOAD
  // ════════════════════════════════════════════════════════════════

  const WorkloadTab = () => {
    const chartData = workload.map(user => ({
      name: user.name.split(' ')[0], // Primeiro nome
      utilization: user.utilization,
      activeLeads: user.activeLeads,
      maxCapacity: user.maxCapacity
    }));

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <KPICard
            title="Usuários Ativos"
            value={workload.length}
            subtitle="no sistema"
            icon="👥"
            color="blue-500"
          />
          <KPICard
            title="Total de Leads"
            value={workload.reduce((sum, u) => sum + u.activeLeads, 0)}
            subtitle="atribuídos"
            icon="📋"
            color="green-500"
          />
          <KPICard
            title="Utilização Média"
            value={workload.length > 0 ? (workload.reduce((sum, u) => sum + u.utilization, 0) / workload.length).toFixed(0) : 0}
            subtitle="em %"
            icon="⚙️"
            color="purple-500"
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Utilização por Usuário</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="utilization" fill="#3b82f6" name="Utilização (%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Leads Ativos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Capacidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Utilização</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Especialidades</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {workload.map(user => (
                <tr key={user.userId} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.activeLeads}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.maxCapacity}</td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            user.utilization > 80 ? 'bg-red-500' : user.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${user.utilization}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{user.utilization}%</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-1 flex-wrap">
                      {user.specialties?.map(spec => (
                        <span key={spec} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {spec}
                        </span>
                      )) || <span className="text-gray-400">N/A</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      user.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isAvailable ? '✓ Disponível' : '✗ Indisponível'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // ABA: REGRAS
  // ════════════════════════════════════════════════════════════════

  const RulesTab = () => {
    const activeRules = rules.filter(r => r.isActive);
    const inactiveRules = rules.filter(r => !r.isActive);

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <KPICard
            title="Regras Ativas"
            value={activeRules.length}
            subtitle="automações rodando"
            icon="⚙️"
            color="green-500"
          />
          <KPICard
            title="Regras Inativas"
            value={inactiveRules.length}
            subtitle="desativadas"
            icon="🔒"
            color="gray-500"
          />
          <KPICard
            title="Total de Regras"
            value={rules.length}
            subtitle="no sistema"
            icon="📋"
            color="blue-500"
          />
        </div>

        {/* Regras Ativas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Regras Ativas</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trigger</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Prioridade</th>
              </tr>
            </thead>
            <tbody>
              {activeRules.length > 0 ? (
                activeRules.map(rule => (
                  <tr key={rule.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{rule.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rule.trigger}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rule.action}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        P{rule.priority}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma regra ativa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Regras Inativas */}
        {inactiveRules.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Regras Inativas</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trigger</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Prioridade</th>
                </tr>
              </thead>
              <tbody>
                {inactiveRules.map(rule => (
                  <tr key={rule.id} className="border-b hover:bg-gray-50 opacity-60">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{rule.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rule.trigger}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rule.action}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                        P{rule.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // ABA: LOGS
  // ════════════════════════════════════════════════════════════════

  const LogsTab = () => {
    const executedLogs = logs.filter(l => l.status === 'EXECUTED');
    const failedLogs = logs.filter(l => l.status === 'FAILED');

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <KPICard
            title="Automações Executadas"
            value={executedLogs.length}
            subtitle="últimas 20"
            icon="✅"
            color="green-500"
          />
          <KPICard
            title="Erros"
            value={failedLogs.length}
            subtitle="falhadas"
            icon="❌"
            color="red-500"
          />
          <KPICard
            title="Taxa de Sucesso"
            value={logs.length > 0 ? ((executedLogs.length / logs.length) * 100).toFixed(0) : 0}
            subtitle="em %"
            icon="📈"
            color="green-500"
          />
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Audit Trail (Últimas 20)</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trigger</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{log.trigger}</td>
                    <td className="px-6 py-4 text-gray-600">{log.action}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        log.status === 'EXECUTED' ? 'bg-green-100 text-green-800' :
                        log.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs max-w-md truncate">
                      {log.result ? JSON.stringify(log.result) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum log disponível
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Dashboard de Automações</h1>
          <p className="text-gray-600">Monitorar e gerenciar automações, scores e atribuições de leads</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {[
              { id: 'scores', label: '📊 Scores', icon: 'scores' },
              { id: 'workload', label: '👥 Workload', icon: 'workload' },
              { id: 'rules', label: '⚙️ Regras', icon: 'rules' },
              { id: 'logs', label: '📝 Logs', icon: 'logs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">⏳</div>
                <p className="text-gray-600 mt-4">Carregando dados...</p>
              </div>
            ) : (
              <>
                {activeTab === 'scores' && <ScoresTab />}
                {activeTab === 'workload' && <WorkloadTab />}
                {activeTab === 'rules' && <RulesTab />}
                {activeTab === 'logs' && <LogsTab />}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>Dashboard atualizado automaticamente a cada 30 segundos</p>
          <button
            onClick={loadDashboardData}
            className="text-blue-500 hover:text-blue-700 mt-2 underline"
          >
            Atualizar agora
          </button>
        </div>
      </div>
    </div>
  );
}
