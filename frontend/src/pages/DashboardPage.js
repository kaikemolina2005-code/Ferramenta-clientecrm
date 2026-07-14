import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, SimpleGrid, Flex, Text, Input, FormLabel, Spinner, Center, useColorModeValue, } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import Card from '@/components/horizon/Card';
import MiniStatistics from '@/components/horizon/MiniStatistics';
import api from '@/services/api';
import { DEMO_FALLBACK, demoDashboard } from '@/utils/demoData';
const AD_SPEND_STORAGE_KEY = 'dashboard_ad_spend';
const SOURCE_LABELS = {
    WHATSAPP: 'WhatsApp',
    SITE: 'Site',
    REFERRAL: 'Indicação',
    MANUAL: 'Manual',
};
// Paleta da marca (azul marinho + ouro + status)
const BRAND_DARK = '#003f7f';
const BRAND_LIGHT = '#1565c0';
const GOLD = '#c9a961';
const PIE_COLORS = [BRAND_DARK, BRAND_LIGHT, GOLD, '#27ae60', '#c0392b'];
export function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [leadAnalytics, setLeadAnalytics] = useState(null);
    const [conversionMetrics, setConversionMetrics] = useState(null);
    const [timeSeries, setTimeSeries] = useState([]);
    const [adSpend, setAdSpend] = useState(() => localStorage.getItem(AD_SPEND_STORAGE_KEY) || '');
    const titleColor = useColorModeValue('navy.700', 'white');
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
            const ov = overviewRes.data.data;
            const la = leadAnalyticsRes.data.data;
            const cm = conversionRes.data.data;
            const ts = timeSeriesRes.data.data || [];
            // Sem dados reais ainda? Usa demonstracao para visualizar o layout.
            const empty = !ov?.summary?.totalLeads;
            if (DEMO_FALLBACK && empty) {
                setOverview(demoDashboard.overview);
                setLeadAnalytics(demoDashboard.leadAnalytics);
                setConversionMetrics(demoDashboard.conversionMetrics);
                setTimeSeries(demoDashboard.timeSeries);
            }
            else {
                setOverview(ov);
                setLeadAnalytics(la);
                setConversionMetrics(cm);
                setTimeSeries(ts);
            }
        }
        catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAdSpendChange = (value) => {
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
        .filter((item) => item.source)
        .map((item) => ({
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
    // ---- Configuracao dos graficos (estilo Horizon UI) ----
    // Linha suave com sombra projetada, sem grade nem eixo Y (igual TotalSpent do Horizon)
    const lineOptions = {
        chart: {
            toolbar: { show: false },
            fontFamily: 'Segoe UI, sans-serif',
            dropShadow: { enabled: true, top: 13, left: 0, blur: 10, opacity: 0.1, color: BRAND_DARK },
        },
        colors: [BRAND_DARK, GOLD],
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 0 },
        tooltip: { theme: 'dark' },
        dataLabels: { enabled: false },
        xaxis: {
            categories: timeSeries.map((d) => d.date),
            labels: { style: { colors: '#A3AED0', fontSize: '12px', fontWeight: '500' } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: { show: false },
        legend: { show: true, position: 'top' },
        grid: { show: false },
    };
    const lineSeries = [
        { name: 'Leads', data: timeSeries.map((d) => d.leadsCreated ?? 0) },
        { name: 'Conversões', data: timeSeries.map((d) => d.converted ?? 0) },
    ];
    // Donut moderno (igual Your Pie Chart do Horizon)
    const pieOptions = {
        labels: originData.map((d) => d.name),
        colors: PIE_COLORS,
        fill: { colors: PIE_COLORS },
        legend: { show: true, position: 'bottom' },
        chart: { fontFamily: 'Segoe UI, sans-serif' },
        dataLabels: { enabled: false },
        states: { hover: { filter: { type: 'none' } } },
        plotOptions: { pie: { donut: { size: '70%' } } },
        tooltip: { enabled: true, theme: 'dark' },
    };
    const pieSeries = originData.map((d) => d.value);
    // Barras arredondadas com gradiente vertical (igual Daily Traffic do Horizon)
    const barOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'Segoe UI, sans-serif' },
        colors: [BRAND_DARK, GOLD],
        tooltip: { theme: 'dark' },
        dataLabels: { enabled: false },
        plotOptions: { bar: { borderRadius: 10, columnWidth: '30px' } },
        fill: {
            type: 'gradient',
            gradient: {
                type: 'vertical',
                shadeIntensity: 1,
                opacityFrom: 1,
                opacityTo: 0.4,
            },
        },
        xaxis: {
            categories: topPerformers.map((p) => p.userName),
            labels: { style: { colors: '#A3AED0', fontSize: '14px', fontWeight: '500' } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: { labels: { style: { colors: '#A3AED0' } } },
        grid: { borderColor: 'rgba(163, 174, 208, 0.3)', strokeDashArray: 5 },
        legend: { show: true, position: 'top' },
    };
    const barSeries = [
        { name: 'Convertidos', data: topPerformers.map((p) => p.converted ?? 0) },
        { name: 'Taxa (%)', data: topPerformers.map((p) => p.rate ?? 0) },
    ];
    if (loading) {
        return (_jsx(Center, { h: "60vh", children: _jsxs(Box, { textAlign: "center", children: [_jsx(Spinner, { size: "xl", thickness: "4px", color: "brand.600", mb: "16px" }), _jsx(Text, { color: "brand.600", fontWeight: "600", children: "Carregando Dashboard..." })] }) }));
    }
    return (_jsxs(Box, { children: [_jsx(SimpleGrid, { columns: { base: 1, md: 2, lg: 3, '2xl': 5 }, gap: "20px", mb: "20px", children: metrics.map((metric, idx) => (_jsx(MiniStatistics, { label: metric.label, value: metric.value, icon: metric.icon }, idx))) }), _jsxs(Card, { mb: "20px", children: [_jsx(Text, { fontSize: "lg", fontWeight: "700", color: titleColor, mb: "12px", children: "\uD83D\uDCB0 Configurar CPC" }), _jsxs(Flex, { align: "center", gap: "12px", flexWrap: "wrap", children: [_jsx(FormLabel, { m: "0", fontSize: "sm", color: "secondaryGray.700", children: "Investimento total em an\u00FAncios (R$):" }), _jsx(Input, { type: "number", min: "0", step: "0.01", value: adSpend, onChange: (e) => handleAdSpendChange(e.target.value), placeholder: "Ex: 1500.00", w: "180px", borderRadius: "12px" }), _jsx(Text, { fontSize: "xs", color: "secondaryGray.700", children: "O CPC \u00E9 calculado dividindo esse valor pelo total de leads recebidos." })] })] }), _jsxs(Card, { mb: "20px", children: [_jsx(Text, { fontSize: "lg", fontWeight: "700", color: titleColor, mb: "12px", children: "\uD83D\uDCC8 Leads x Convers\u00F5es (30 dias)" }), _jsx(Box, { h: "320px", children: _jsx(ReactApexChart, { options: lineOptions, series: lineSeries, type: "line", height: "100%", width: "100%" }) })] }), _jsxs(SimpleGrid, { columns: { base: 1, lg: 2 }, gap: "20px", children: [_jsxs(Card, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "700", color: titleColor, mb: "12px", children: "\uD83C\uDF0D Origem dos Leads" }), originData.length === 0 ? (_jsx(Center, { h: "300px", children: _jsx(Text, { color: "secondaryGray.700", children: "Sem dados de origem dispon\u00EDveis ainda." }) })) : (_jsx(Box, { h: "320px", children: _jsx(ReactApexChart, { options: pieOptions, series: pieSeries, type: "donut", height: "100%", width: "100%" }) }))] }), _jsxs(Card, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "700", color: titleColor, mb: "12px", children: "\uD83C\uDFC6 Convers\u00E3o por Respons\u00E1vel" }), topPerformers.length === 0 ? (_jsx(Center, { h: "300px", children: _jsx(Text, { color: "secondaryGray.700", children: "Sem convers\u00F5es registradas no per\u00EDodo." }) })) : (_jsx(Box, { h: "320px", children: _jsx(ReactApexChart, { options: barOptions, series: barSeries, type: "bar", height: "100%", width: "100%" }) }))] })] })] }));
}
