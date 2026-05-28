import api from './api';

interface AnalysisResult {
  success: boolean;
  documentType?: string;
  extractedData?: Record<string, string>;
  summary?: string;
  keyPoints?: string[];
  classification?: string;
  confidence?: number;
  error?: string;
}

interface AIStatus {
  configured: boolean;
  provider: string;
  model: string;
  message: string;
}

export const aiService = {
  /**
   * Verificar status da IA
   */
  async getStatus(): Promise<AIStatus> {
    const response = await api.get('/ai/status');
    return response.data;
  },

  /**
   * Analisar um documento
   */
  async analyzeDocument(documentId: string, documentType?: string): Promise<AnalysisResult> {
    const response = await api.post(`/ai/documents/${documentId}/analyze`, {
      documentType,
    });
    return response.data.analysis;
  },

  /**
   * Extrair dados estruturados
   */
  async extractData(
    documentId: string,
    dataSchema: Record<string, string>
  ): Promise<AnalysisResult> {
    const response = await api.post(`/ai/documents/${documentId}/extract`, {
      dataSchema,
    });
    return response.data;
  },

  /**
   * Gerar resumo
   */
  async summarizeDocument(documentId: string): Promise<AnalysisResult> {
    const response = await api.post(`/ai/documents/${documentId}/summarize`);
    return response.data;
  },

  /**
   * Preencher formulário
   */
  async fillFormFields(
    leadId: string,
    documentId: string,
    formTemplate: string
  ): Promise<{ filledForm: string; leadId: string }> {
    const response = await api.post(`/ai/leads/${leadId}/fill-form/${documentId}`, {
      formTemplate,
    });
    return response.data;
  },

  /**
   * Processar todos os documentos de um lead
   */
  async processAllDocuments(
    leadId: string
  ): Promise<{ totalDocuments: number; processedCount: number; results: any[] }> {
    const response = await api.post(`/ai/leads/${leadId}/process-all`);
    return response.data;
  },
};

export default aiService;
