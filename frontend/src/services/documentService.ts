import api from './api';
import { Document } from '@/types';

export const documentService = {
  async uploadDocument(leadId: string, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/documents/lead/${leadId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  async getLeadDocuments(leadId: string): Promise<Document[]> {
    const response = await api.get(`/documents/lead/${leadId}`);
    return response.data.data || [];
  },

  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  },

  async downloadDocument(documentId: string): Promise<void> {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });

    // Criar link de download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'document');
    document.body.appendChild(link);
    link.click();
    link.parentElement?.removeChild(link);
  },

  async processDocument(documentId: string): Promise<Document> {
    const response = await api.patch(`/documents/${documentId}/process`);
    return response.data.data;
  },

  async uploadToOneDrive(file: File, leadId?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (leadId) formData.append('leadId', leadId);

    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getDocumentsByLead(leadId: string): Promise<Document[]> {
    const response = await api.get(`/leads/${leadId}/documents`);
    return response.data;
  },

  async processDocumentWithAI(documentId: string): Promise<any> {
    const response = await api.post(`/documents/${documentId}/process-ai`);
    return response.data;
  },

  async fillDocumentForm(documentId: string, leadData: any): Promise<any> {
    const response = await api.post(`/documents/${documentId}/fill-form`, {
      leadData,
    });
    return response.data;
  },
};
