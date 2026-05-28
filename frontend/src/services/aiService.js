import api from './api';
export const aiService = {
    /**
     * Verificar status da IA
     */
    async getStatus() {
        const response = await api.get('/ai/status');
        return response.data;
    },
    /**
     * Analisar um documento
     */
    async analyzeDocument(documentId, documentType) {
        const response = await api.post(`/ai/documents/${documentId}/analyze`, {
            documentType,
        });
        return response.data.analysis;
    },
    /**
     * Extrair dados estruturados
     */
    async extractData(documentId, dataSchema) {
        const response = await api.post(`/ai/documents/${documentId}/extract`, {
            dataSchema,
        });
        return response.data;
    },
    /**
     * Gerar resumo
     */
    async summarizeDocument(documentId) {
        const response = await api.post(`/ai/documents/${documentId}/summarize`);
        return response.data;
    },
    /**
     * Preencher formulário
     */
    async fillFormFields(leadId, documentId, formTemplate) {
        const response = await api.post(`/ai/leads/${leadId}/fill-form/${documentId}`, {
            formTemplate,
        });
        return response.data;
    },
    /**
     * Processar todos os documentos de um lead
     */
    async processAllDocuments(leadId) {
        const response = await api.post(`/ai/leads/${leadId}/process-all`);
        return response.data;
    },
};
export default aiService;
