import { Router } from 'express';
import { getReportsOverview, getLeadAnalytics, getConversionMetrics, getAutomationReports, getTimeSeriesData, generatePDFReport, exportToCSV } from '../controllers/reports.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Todos os endpoints requerem autenticação
router.use(authMiddleware);

// Overview & KPIs
router.get('/overview', getReportsOverview);

// Análise de Leads
router.get('/leads-analytics', getLeadAnalytics);

// Métricas de Conversão
router.get('/conversion-metrics', getConversionMetrics);

// Relatórios de Automação
router.get('/automation-reports', getAutomationReports);

// Série Temporal (para gráficos)
router.get('/time-series', getTimeSeriesData);

// Exportação
router.post('/export-pdf', generatePDFReport);
router.post('/export-csv', exportToCSV);

export default router;
