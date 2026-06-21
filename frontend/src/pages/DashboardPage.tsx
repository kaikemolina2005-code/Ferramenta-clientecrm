import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Flex,
  Text,
  Input,
  FormLabel,
  Spinner,
  Center,
} from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import Card from '@/components/horizon/Card';
import MiniStatistics from '@/components/horizon/MiniStatistics';
import api from '@/services/api';

const AD_SPEND_STORAGE_KEY = 'dashboard_ad_spend';

const SOURCE_LABELS: Record<string, string> = {
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

  // ---- Configuracao dos graficos (ApexCharts) ----
  const lineOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'Segoe UI, sans-serif' },
    colors: [BRAND_DARK, GOLD],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 0 },
    xaxis: {
      categories: timeSeries.map((d) => d.date),
      labels: { style: { colors: '#8f9bba' } },
    },
    yaxis: { labels: { style: { colors: '#8f9bba' } } },
    grid: { borderColor: '#e0e5f2' },
    legend: { show: true, position: 'top' },
    tooltip: { theme: 'light' },
    dataLabels: { enabled: false },
  };
  const lineSeries = [
    { name: 'Leads', data: timeSeries.map((d) => d.leadsCreated ?? 0) },
    { name: 'Conversões', data: timeSeries.map((d) => d.converted ?? 0) },
  ];

  const pieOptions: ApexOptions = {
    labels: originData.map((d: any) => d.name),
    colors: PIE_COLORS,
    legend: { position: 'bottom' },
    chart: { fontFamily: 'Segoe UI, sans-serif' },
    dataLabels: { enabled: true },
  };
  const pieSeries = originData.map((d: any) => d.value);

  const barOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'Segoe UI, sans-serif' },
    colors: [BRAND_DARK, GOLD],
    plotOptions: { bar: { borderRadius: 8, columnWidth: '40%' } },
    xaxis: {
      categories: topPerformers.map((p: any) => p.userName),
      labels: { style: { colors: '#8f9bba' } },
    },
    yaxis: { labels: { style: { colors: '#8f9bba' } } },
    grid: { borderColor: '#e0e5f2' },
    legend: { show: true, position: 'top' },
    dataLabels: { enabled: false },
  };
  const barSeries = [
    { name: 'Convertidos', data: topPerformers.map((p: any) => p.converted ?? 0) },
    { name: 'Taxa (%)', data: topPerformers.map((p: any) => p.rate ?? 0) },
  ];

  if (loading) {
    return (
      <Center h="60vh">
        <Box textAlign="center">
          <Spinner size="xl" thickness="4px" color="brand.600" mb="16px" />
          <Text color="brand.600" fontWeight="600">
            Carregando Dashboard...
          </Text>
        </Box>
      </Center>
    );
  }

  return (
    <Box>
      {/* KPIs */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, '2xl': 5 }} gap="20px" mb="20px">
        {metrics.map((metric, idx) => (
          <MiniStatistics key={idx} label={metric.label} value={metric.value} icon={metric.icon} />
        ))}
      </SimpleGrid>

      {/* Configurar CPC */}
      <Card mb="20px">
        <Text fontSize="lg" fontWeight="700" color="navy.700" mb="12px">
          💰 Configurar CPC
        </Text>
        <Flex align="center" gap="12px" flexWrap="wrap">
          <FormLabel m="0" fontSize="sm" color="secondaryGray.700">
            Investimento total em anúncios (R$):
          </FormLabel>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={adSpend}
            onChange={(e) => handleAdSpendChange(e.target.value)}
            placeholder="Ex: 1500.00"
            w="180px"
            borderRadius="12px"
          />
          <Text fontSize="xs" color="secondaryGray.700">
            O CPC é calculado dividindo esse valor pelo total de leads recebidos.
          </Text>
        </Flex>
      </Card>

      {/* Grafico de linha (largura total) */}
      <Card mb="20px">
        <Text fontSize="lg" fontWeight="700" color="navy.700" mb="12px">
          📈 Leads x Conversões (30 dias)
        </Text>
        <Box h="320px">
          <ReactApexChart options={lineOptions} series={lineSeries} type="line" height="100%" width="100%" />
        </Box>
      </Card>

      {/* Pizza + Barras */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="20px">
        <Card>
          <Text fontSize="lg" fontWeight="700" color="navy.700" mb="12px">
            🌍 Origem dos Leads
          </Text>
          {originData.length === 0 ? (
            <Center h="300px">
              <Text color="secondaryGray.700">Sem dados de origem disponíveis ainda.</Text>
            </Center>
          ) : (
            <Box h="320px">
              <ReactApexChart options={pieOptions} series={pieSeries} type="pie" height="100%" width="100%" />
            </Box>
          )}
        </Card>

        <Card>
          <Text fontSize="lg" fontWeight="700" color="navy.700" mb="12px">
            🏆 Conversão por Responsável
          </Text>
          {topPerformers.length === 0 ? (
            <Center h="300px">
              <Text color="secondaryGray.700">Sem conversões registradas no período.</Text>
            </Center>
          ) : (
            <Box h="320px">
              <ReactApexChart options={barOptions} series={barSeries} type="bar" height="100%" width="100%" />
            </Box>
          )}
        </Card>
      </SimpleGrid>
    </Box>
  );
}
