import { Request, Response } from 'express';
import { reportsService } from '../services/reportsService.js';

/**
 * GET /api/reports/overview
 * Retorna KPIs principais
 */
export async function getReportsOverview(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const data = await reportsService.getOverview(start, end);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Erro ao obter overview:', error);
    res.status(500).json({ success: false, error: 'Erro ao gerar relatório de overview' });
  }
}

/**
 * GET /api/reports/leads-analytics
 * Retorna análise detalhada de leads
 */
export async function getLeadAnalytics(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const data = await reportsService.getLeadAnalytics(start, end);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Erro ao obter lead analytics:', error);
    res.status(500).json({ success: false, error: 'Erro ao gerar análise de leads' });
  }
}

/**
 * GET /api/reports/conversion-metrics
 * Retorna métricas de conversão
 */
export async function getConversionMetrics(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const data = await reportsService.getConversionMetrics(start, end);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Erro ao obter conversion metrics:', error);
    res.status(500).json({ success: false, error: 'Erro ao gerar métricas de conversão' });
  }
}

/**
 * GET /api/reports/automation-reports
 * Retorna relatórios de automação
 */
export async function getAutomationReports(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const data = await reportsService.getAutomationReports(start, end);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Erro ao obter automation reports:', error);
    res.status(500).json({ success: false, error: 'Erro ao gerar relatórios de automação' });
  }
}

/**
 * GET /api/reports/time-series
 * Retorna dados para gráficos de série temporal
 */
export async function getTimeSeriesData(req: Request, res: Response) {
  try {
    const { days = '30' } = req.query;
    const numDays = parseInt(days as string);

    const data = await reportsService.getTimeSeriesData(numDays);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Erro ao obter time series data:', error);
    res.status(500).json({ success: false, error: 'Erro ao gerar dados de série temporal' });
  }
}

/**
 * POST /api/reports/export-pdf
 * Gera PDF com relatório
 */
export async function generatePDFReport(req: Request, res: Response) {
  try {
    const { type, startDate, endDate } = req.body;

    // Por enquanto, retornar estrutura preparada
    const reportType = type || 'overview';
    let data: any;

    switch (reportType) {
      case 'leads':
        data = await reportsService.getLeadAnalytics(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        break;
      case 'conversion':
        data = await reportsService.getConversionMetrics(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        break;
      case 'automation':
        data = await reportsService.getAutomationReports(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        break;
      default:
        data = await reportsService.getOverview(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
    }

    // Nota: Para PDF real, integrar com pdfkit ou puppeteer
    res.json({
      success: true,
      message: 'PDF gerado com sucesso',
      data,
      note: 'Integrar com pdfkit ou puppeteer para PDF real'
    });
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    res.status(500).json({ success: false, error: 'Erro ao gerar PDF' });
  }
}

/**
 * POST /api/reports/export-csv
 * Exporta dados como CSV
 */
export async function exportToCSV(req: Request, res: Response) {
  try {
    const { type, startDate, endDate } = req.body;

    let data: any;

    switch (type) {
      case 'leads':
        data = await reportsService.getLeadAnalytics(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        break;
      case 'conversion':
        data = await reportsService.getConversionMetrics(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        break;
      case 'automation':
        data = await reportsService.getAutomationReports(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        break;
      default:
        data = await reportsService.getOverview(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
    }

    // Converter para CSV
    const csv = convertToCSV(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${type || 'overview'}-${new Date().toISOString()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Erro ao exportar CSV:', error);
    res.status(500).json({ success: false, error: 'Erro ao exportar CSV' });
  }
}

/**
 * Helper: Converter objeto para CSV
 */
function convertToCSV(data: any): string {
  const lines: string[] = [];

  // Cabeçalho
  const headers = Object.keys(flattenObject(data[0] || data)).join(',');
  lines.push(headers);

  // Linhas
  const dataArray = Array.isArray(data) ? data : [data];
  dataArray.forEach(row => {
    const values = Object.values(flattenObject(row)).map(v =>
      typeof v === 'string' && v.includes(',') ? `"${v}"` : v
    );
    lines.push(values.join(','));
  });

  return lines.join('\n');
}

/**
 * Helper: Flatten nested objects
 */
function flattenObject(obj: any, prefix = ''): any {
  const flattened: any = {};

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
}
