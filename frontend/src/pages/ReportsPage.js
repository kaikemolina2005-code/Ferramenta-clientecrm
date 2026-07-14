import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Button } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import api from '../services/api';
export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [overviewData, setOverviewData] = useState(null);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    useEffect(() => {
        loadReports();
    }, [dateRange]);
    const loadReports = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dateRange.start)
                params.append('startDate', dateRange.start);
            if (dateRange.end)
                params.append('endDate', dateRange.end);
            const queryStr = params.toString();
            const [overview, timeSeries] = await Promise.all([
                api.get(`/reports/overview${queryStr ? `?${queryStr}` : ''}`).catch(() => ({ data: { data: null } })),
                api.get('/reports/time-series?days=30').catch(() => ({ data: { data: [] } }))
            ]);
            setOverviewData(overview.data.data);
            setTimeSeriesData(timeSeries.data.data || []);
        }
        catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const KPICard = ({ title, value, subtitle, icon, color }) => (_jsxs(Card, { title: title, icon: icon, hoverable: true, style: {
            borderLeft: `4px solid ${color || designSystem.colors.primary.dark}`
        }, children: [_jsx("p", { style: {
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: designSystem.colors.primary.dark,
                    margin: '8px 0'
                }, children: value }), subtitle && (_jsx("p", { style: {
                    fontSize: '12px',
                    color: designSystem.colors.neutral.gray500,
                    margin: '4px 0 0 0'
                }, children: subtitle }))] }));
    const OverviewTab = () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px'
                }, children: [_jsx(KPICard, { title: "Total de Leads", value: overviewData?.summary?.totalLeads || 0, subtitle: `${overviewData?.summary?.convertedLeads || 0} convertidos`, icon: "\uD83D\uDC65", color: designSystem.colors.primary.dark }), _jsx(KPICard, { title: "Taxa de Convers\u00E3o", value: `${overviewData?.summary?.conversionRate || 0}%`, subtitle: "do per\u00EDodo", icon: "\uD83D\uDCC8", color: designSystem.colors.status.success }), _jsx(KPICard, { title: "Score M\u00E9dio", value: `${overviewData?.summary?.averageScore || 0}/100`, subtitle: `Min: ${overviewData?.summary?.minScore || 0} Max: ${overviewData?.summary?.maxScore || 0}`, icon: "\u2B50", color: designSystem.colors.accent.gold })] }), overviewData?.statusDistribution && (_jsx(Card, { title: "Distribui\u00E7\u00E3o por Status", icon: "\uD83D\uDCCA", hoverable: true, children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: overviewData.statusDistribution, dataKey: "_count", nameKey: "status", cx: "50%", cy: "50%", outerRadius: 100, label: true, children: [
                                    designSystem.colors.primary.dark,
                                    designSystem.colors.status.success,
                                    designSystem.colors.accent.gold,
                                    designSystem.colors.status.error,
                                    designSystem.colors.primary.light
                                ].map((color, i) => (_jsx(Cell, { fill: color }, `cell-${i}`))) }), _jsx(Tooltip, { contentStyle: {
                                    backgroundColor: designSystem.colors.neutral.white,
                                    border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                    borderRadius: '8px'
                                } })] }) }) }))] }));
    const TimeSeriesTab = () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsx(Card, { title: "Leads Criados (\u00FAltimos 30 dias)", icon: "\uD83D\uDCC8", hoverable: true, children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: timeSeriesData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: designSystem.colors.neutral.gray300 }), _jsx(XAxis, { dataKey: "date", stroke: designSystem.colors.neutral.gray500 }), _jsx(YAxis, { stroke: designSystem.colors.neutral.gray500 }), _jsx(Tooltip, { contentStyle: {
                                    backgroundColor: designSystem.colors.neutral.white,
                                    border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                    borderRadius: '8px'
                                } }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "leadsCreated", stroke: designSystem.colors.primary.dark, name: "Leads Criados", strokeWidth: 2 }), _jsx(Line, { type: "monotone", dataKey: "converted", stroke: designSystem.colors.status.success, name: "Convertidos", strokeWidth: 2 })] }) }) }), _jsx(Card, { title: "Taxa de Convers\u00E3o Di\u00E1ria", icon: "\uD83D\uDCCA", hoverable: true, children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: timeSeriesData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: designSystem.colors.neutral.gray300 }), _jsx(XAxis, { dataKey: "date", stroke: designSystem.colors.neutral.gray500 }), _jsx(YAxis, { stroke: designSystem.colors.neutral.gray500 }), _jsx(Tooltip, { formatter: (v) => `${v}%` }), _jsx(Bar, { dataKey: "conversionRate", fill: designSystem.colors.accent.gold, radius: [8, 8, 0, 0] })] }) }) })] }));
    return (_jsx("div", { children: _jsxs("div", { style: { maxWidth: '1200px', margin: '0 auto' }, children: [_jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h1", { style: {
                                fontSize: '32px',
                                fontWeight: 'bold',
                                color: designSystem.colors.primary.dark,
                                margin: '0 0 8px 0'
                            }, children: "\uD83D\uDCCA Relat\u00F3rios & Analytics" }), _jsx("p", { style: {
                                color: designSystem.colors.neutral.gray600,
                                margin: '0'
                            }, children: "An\u00E1lise completa de leads e convers\u00F5es" })] }), _jsx(Card, { title: "Filtros", icon: "\uD83D\uDD0D", hoverable: true, style: { marginBottom: '24px' }, children: _jsxs("div", { style: { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: designSystem.colors.primary.dark,
                                            marginBottom: '6px'
                                        }, children: "Data Inicial" }), _jsx("input", { type: "date", value: dateRange.start, onChange: (e) => setDateRange({ ...dateRange, start: e.target.value }), style: {
                                            padding: '8px 12px',
                                            border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                            borderRadius: '6px',
                                            fontSize: '13px'
                                        } })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: designSystem.colors.primary.dark,
                                            marginBottom: '6px'
                                        }, children: "Data Final" }), _jsx("input", { type: "date", value: dateRange.end, onChange: (e) => setDateRange({ ...dateRange, end: e.target.value }), style: {
                                            padding: '8px 12px',
                                            border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                            borderRadius: '6px',
                                            fontSize: '13px'
                                        } })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginLeft: 'auto' }, children: [_jsx(Button, { variant: "secondary", children: "\uD83D\uDCE5 PDF" }), _jsx(Button, { variant: "primary", children: "\uD83D\uDCCA CSV" })] })] }) }), _jsxs("div", { style: {
                        backgroundColor: designSystem.colors.neutral.white,
                        borderRadius: '12px',
                        boxShadow: designSystem.shadows.md,
                        overflow: 'hidden'
                    }, children: [_jsx("div", { style: {
                                display: 'flex',
                                borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
                                overflowX: 'auto'
                            }, children: [
                                { id: 'overview', label: '📊 Overview' },
                                { id: 'timeseries', label: '📈 Série Temporal' }
                            ].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab.id), style: {
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
                                }, onMouseEnter: (e) => {
                                    if (activeTab !== tab.id) {
                                        e.currentTarget.style.backgroundColor = designSystem.colors.neutral.light;
                                    }
                                }, onMouseLeave: (e) => {
                                    if (activeTab !== tab.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }, children: tab.label }, tab.id))) }), _jsx("div", { style: { padding: '24px' }, children: loading ? (_jsxs("div", { style: {
                                    textAlign: 'center',
                                    padding: '48px 24px',
                                    color: designSystem.colors.neutral.gray500
                                }, children: [_jsx("div", { style: { fontSize: '32px', marginBottom: '12px' }, children: "\u23F3" }), _jsx("p", { children: "Carregando relat\u00F3rios..." })] })) : (_jsxs(_Fragment, { children: [activeTab === 'overview' && _jsx(OverviewTab, {}), activeTab === 'timeseries' && _jsx(TimeSeriesTab, {})] })) })] })] }) }));
}
