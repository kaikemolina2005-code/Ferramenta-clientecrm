import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
export default function AutomationDashboard() {
    const [activeTab, setActiveTab] = useState('scores');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Data states
    const [scoreDistribution, setScoreDistribution] = useState(null);
    const [workload, setWorkload] = useState([]);
    const [rules, setRules] = useState([]);
    const [logs, setLogs] = useState([]);
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
        }
        catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Erro ao carregar dados do dashboard');
        }
        finally {
            setLoading(false);
        }
    };
    // ════════════════════════════════════════════════════════════════
    // KPI CARDS
    // ════════════════════════════════════════════════════════════════
    const KPICard = ({ title, value, subtitle, icon, color }) => (_jsx("div", { className: `bg-white rounded-lg shadow p-6 border-l-4 border-${color}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-sm font-medium", children: title }), _jsx("p", { className: "text-3xl font-bold text-gray-800 mt-2", children: value }), subtitle && _jsx("p", { className: "text-xs text-gray-400 mt-1", children: subtitle })] }), _jsx("div", { className: `text-4xl opacity-20`, children: icon })] }) }));
    // ════════════════════════════════════════════════════════════════
    // ABA: SCORES
    // ════════════════════════════════════════════════════════════════
    const ScoresTab = () => {
        if (!scoreDistribution) {
            return _jsx("div", { className: "text-center py-8", children: "Carregando dados de scores..." });
        }
        const chartData = [
            { name: 'Excelente', value: scoreDistribution.excellent, color: '#10b981' },
            { name: 'Bom', value: scoreDistribution.good, color: '#3b82f6' },
            { name: 'Médio', value: scoreDistribution.medium, color: '#f59e0b' },
            { name: 'Baixo', value: scoreDistribution.poor, color: '#ef4444' }
        ];
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsx(KPICard, { title: "Score M\u00E9dio", value: scoreDistribution.average.toFixed(1), subtitle: "de 100", icon: "\uD83D\uDCCA", color: "blue-500" }), _jsx(KPICard, { title: "Leads", value: scoreDistribution.total, subtitle: "total no sistema", icon: "\uD83D\uDC65", color: "green-500" }), _jsx(KPICard, { title: "Excelentes", value: scoreDistribution.excellent, subtitle: "score 80-100", icon: "\u2B50", color: "green-500" }), _jsx(KPICard, { title: "Cr\u00EDticos", value: scoreDistribution.poor, subtitle: "score < 40", icon: "\u26A0\uFE0F", color: "red-500" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Distribui\u00E7\u00E3o de Scores" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, value }) => `${name}: ${value}`, outerRadius: 100, fill: "#8884d8", dataKey: "value", children: chartData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Leads por Faixa" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "value", fill: "#3b82f6", radius: [8, 8, 0, 0] })] }) })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Legenda de Scores" }), _jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-green-500 rounded mr-2" }), _jsx("span", { children: "Excelente (80-100)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-blue-500 rounded mr-2" }), _jsx("span", { children: "Bom (60-79)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-yellow-500 rounded mr-2" }), _jsx("span", { children: "M\u00E9dio (40-59)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-red-500 rounded mr-2" }), _jsx("span", { children: "Baixo (<40)" })] })] })] })] }));
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
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx(KPICard, { title: "Usu\u00E1rios Ativos", value: workload.length, subtitle: "no sistema", icon: "\uD83D\uDC65", color: "blue-500" }), _jsx(KPICard, { title: "Total de Leads", value: workload.reduce((sum, u) => sum + u.activeLeads, 0), subtitle: "atribu\u00EDdos", icon: "\uD83D\uDCCB", color: "green-500" }), _jsx(KPICard, { title: "Utiliza\u00E7\u00E3o M\u00E9dia", value: workload.length > 0 ? (workload.reduce((sum, u) => sum + u.utilization, 0) / workload.length).toFixed(0) : 0, subtitle: "em %", icon: "\u2699\uFE0F", color: "purple-500" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Utiliza\u00E7\u00E3o por Usu\u00E1rio" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => `${value}%` }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "utilization", fill: "#3b82f6", name: "Utiliza\u00E7\u00E3o (%)", radius: [8, 8, 0, 0] })] }) })] }), _jsx("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Usu\u00E1rio" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Leads Ativos" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Capacidade" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Utiliza\u00E7\u00E3o" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Especialidades" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Status" })] }) }), _jsx("tbody", { children: workload.map(user => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 text-sm text-gray-900", children: user.name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: user.activeLeads }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: user.maxCapacity }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "w-32", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all ${user.utilization > 80 ? 'bg-red-500' : user.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'}`, style: { width: `${user.utilization}%` } }) }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [user.utilization, "%"] })] }) }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsx("div", { className: "flex gap-1 flex-wrap", children: user.specialties?.map(spec => (_jsx("span", { className: "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded", children: spec }, spec))) || _jsx("span", { className: "text-gray-400", children: "N/A" }) }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `text-xs font-semibold px-2 py-1 rounded ${user.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: user.isAvailable ? '✓ Disponível' : '✗ Indisponível' }) })] }, user.userId))) })] }) })] }));
    };
    // ════════════════════════════════════════════════════════════════
    // ABA: REGRAS
    // ════════════════════════════════════════════════════════════════
    const RulesTab = () => {
        const activeRules = rules.filter(r => r.isActive);
        const inactiveRules = rules.filter(r => !r.isActive);
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx(KPICard, { title: "Regras Ativas", value: activeRules.length, subtitle: "automa\u00E7\u00F5es rodando", icon: "\u2699\uFE0F", color: "green-500" }), _jsx(KPICard, { title: "Regras Inativas", value: inactiveRules.length, subtitle: "desativadas", icon: "\uD83D\uDD12", color: "gray-500" }), _jsx(KPICard, { title: "Total de Regras", value: rules.length, subtitle: "no sistema", icon: "\uD83D\uDCCB", color: "blue-500" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-green-500 to-green-600 px-6 py-4", children: _jsx("h3", { className: "text-lg font-semibold text-white", children: "Regras Ativas" }) }), _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Nome" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Trigger" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "A\u00E7\u00E3o" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Prioridade" })] }) }), _jsx("tbody", { children: activeRules.length > 0 ? (activeRules.map(rule => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: rule.name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: rule.trigger }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: rule.action }), _jsx("td", { className: "px-6 py-4", children: _jsxs("span", { className: "bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded", children: ["P", rule.priority] }) })] }, rule.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-6 py-4 text-center text-gray-500", children: "Nenhuma regra ativa" }) })) })] })] }), inactiveRules.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4", children: _jsx("h3", { className: "text-lg font-semibold text-white", children: "Regras Inativas" }) }), _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Nome" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Trigger" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "A\u00E7\u00E3o" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Prioridade" })] }) }), _jsx("tbody", { children: inactiveRules.map(rule => (_jsxs("tr", { className: "border-b hover:bg-gray-50 opacity-60", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: rule.name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: rule.trigger }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: rule.action }), _jsx("td", { className: "px-6 py-4", children: _jsxs("span", { className: "bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded", children: ["P", rule.priority] }) })] }, rule.id))) })] })] }))] }));
    };
    // ════════════════════════════════════════════════════════════════
    // ABA: LOGS
    // ════════════════════════════════════════════════════════════════
    const LogsTab = () => {
        const executedLogs = logs.filter(l => l.status === 'EXECUTED');
        const failedLogs = logs.filter(l => l.status === 'FAILED');
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsx(KPICard, { title: "Automa\u00E7\u00F5es Executadas", value: executedLogs.length, subtitle: "\u00FAltimas 20", icon: "\u2705", color: "green-500" }), _jsx(KPICard, { title: "Erros", value: failedLogs.length, subtitle: "falhadas", icon: "\u274C", color: "red-500" }), _jsx(KPICard, { title: "Taxa de Sucesso", value: logs.length > 0 ? ((executedLogs.length / logs.length) * 100).toFixed(0) : 0, subtitle: "em %", icon: "\uD83D\uDCC8", color: "green-500" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4", children: _jsx("h3", { className: "text-lg font-semibold text-white", children: "Audit Trail (\u00DAltimas 20)" }) }), _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Data/Hora" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Trigger" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "A\u00E7\u00E3o" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase", children: "Detalhes" })] }) }), _jsx("tbody", { children: logs.length > 0 ? (logs.map(log => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 text-gray-900 font-medium", children: new Date(log.createdAt).toLocaleString('pt-BR') }), _jsx("td", { className: "px-6 py-4 text-gray-600", children: log.trigger }), _jsx("td", { className: "px-6 py-4 text-gray-600", children: log.action }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `text-xs font-semibold px-2 py-1 rounded ${log.status === 'EXECUTED' ? 'bg-green-100 text-green-800' :
                                                        log.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`, children: log.status }) }), _jsx("td", { className: "px-6 py-4 text-gray-600 text-xs max-w-md truncate", children: log.result ? JSON.stringify(log.result) : '-' })] }, log.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-4 text-center text-gray-500", children: "Nenhum log dispon\u00EDvel" }) })) })] })] })] }));
    };
    // ════════════════════════════════════════════════════════════════
    // RENDER PRINCIPAL
    // ════════════════════════════════════════════════════════════════
    return (_jsx("div", { className: "min-h-screen bg-gray-100 p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "\uD83D\uDCCA Dashboard de Automa\u00E7\u00F5es" }), _jsx("p", { className: "text-gray-600", children: "Monitorar e gerenciar automa\u00E7\u00F5es, scores e atribui\u00E7\u00F5es de leads" })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6", children: error })), _jsxs("div", { className: "bg-white rounded-lg shadow mb-6", children: [_jsx("div", { className: "flex border-b", children: [
                                { id: 'scores', label: '📊 Scores', icon: 'scores' },
                                { id: 'workload', label: '👥 Workload', icon: 'workload' },
                                { id: 'rules', label: '⚙️ Regras', icon: 'rules' },
                                { id: 'logs', label: '📝 Logs', icon: 'logs' }
                            ].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab.id), className: `flex-1 px-4 py-4 text-center font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:text-gray-900'}`, children: tab.label }, tab.id))) }), _jsx("div", { className: "p-6", children: loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "inline-block animate-spin", children: "\u23F3" }), _jsx("p", { className: "text-gray-600 mt-4", children: "Carregando dados..." })] })) : (_jsxs(_Fragment, { children: [activeTab === 'scores' && _jsx(ScoresTab, {}), activeTab === 'workload' && _jsx(WorkloadTab, {}), activeTab === 'rules' && _jsx(RulesTab, {}), activeTab === 'logs' && _jsx(LogsTab, {})] })) })] }), _jsxs("div", { className: "text-center text-gray-600 text-sm", children: [_jsx("p", { children: "Dashboard atualizado automaticamente a cada 30 segundos" }), _jsx("button", { onClick: loadDashboardData, className: "text-blue-500 hover:text-blue-700 mt-2 underline", children: "Atualizar agora" })] })] }) }));
}
