import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
export function DashboardPage() {
    // Mock data
    const leadsData = [
        { month: 'Jan', leads: 45, conversions: 12 },
        { month: 'Fev', leads: 52, conversions: 18 },
        { month: 'Mar', leads: 48, conversions: 15 },
        { month: 'Abr', leads: 61, conversions: 22 },
    ];
    const originData = [
        { name: 'WhatsApp', value: 45, fill: designSystem.colors.primary.dark },
        { name: 'Site', value: 25, fill: designSystem.colors.primary.light },
        { name: 'Indicação', value: 30, fill: designSystem.colors.accent.gold },
    ];
    const metrics = [
        { label: 'Leads Recebidos', value: '206', change: '+12%', icon: '👥' },
        { label: 'Clientes Convertidos', value: '67', change: '+8%', icon: '✅' },
        { label: 'Taxa de Conversão', value: '32.5%', change: '+2%', icon: '📊' },
        { label: 'CPC', value: 'R$ 45.50', change: '-5%', icon: '💰' },
    ];
    return (_jsxs("div", { style: {
            padding: '32px',
            backgroundColor: designSystem.colors.neutral.light,
            minHeight: '100vh'
        }, children: [_jsx("h1", { style: {
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: designSystem.colors.primary.dark,
                    marginBottom: '32px',
                    fontFamily: 'Segoe UI, sans-serif'
                }, children: "\uD83D\uDCCA Dashboard" }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }, children: metrics.map((metric, idx) => (_jsx(Card, { title: metric.label, icon: metric.icon, hoverable: true, children: _jsxs("div", { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }, children: [_jsx("p", { style: {
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: designSystem.colors.primary.dark
                                }, children: metric.value }), _jsx(Badge, { variant: "success", children: metric.change })] }) }, idx))) }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                }, children: [_jsx(Card, { title: "Leads x Convers\u00F5es", icon: "\uD83D\uDCC8", hoverable: true, style: { gridColumn: '1 / -1' }, children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: leadsData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: designSystem.colors.neutral.gray300 }), _jsx(XAxis, { dataKey: "month", stroke: designSystem.colors.neutral.gray500 }), _jsx(YAxis, { stroke: designSystem.colors.neutral.gray500 }), _jsx(Tooltip, { contentStyle: {
                                            backgroundColor: designSystem.colors.neutral.white,
                                            border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                            borderRadius: '8px'
                                        } }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "leads", stroke: designSystem.colors.primary.dark, strokeWidth: 2, dot: { fill: designSystem.colors.primary.dark } }), _jsx(Line, { type: "monotone", dataKey: "conversions", stroke: designSystem.colors.accent.gold, strokeWidth: 2, dot: { fill: designSystem.colors.accent.gold } })] }) }) }), _jsx(Card, { title: "Origem dos Leads", icon: "\uD83C\uDF0D", hoverable: true, children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: originData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, value }) => `${name}: ${value}`, outerRadius: 80, fill: designSystem.colors.primary.dark, dataKey: "value", children: originData.map((entry, index) => (_jsx(Cell, { fill: entry.fill }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                            backgroundColor: designSystem.colors.neutral.white,
                                            border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                            borderRadius: '8px'
                                        } })] }) }) })] })] }));
}
