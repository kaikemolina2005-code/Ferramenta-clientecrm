import api from './api';
import { Lead, LeadTask } from '@/types';

export const leadService = {
  async getAll(page = 1, limit = 20, filters?: any): Promise<{ leads: Lead[]; total: number }> {
    const response = await api.get('/leads', { params: { skip: (page - 1) * limit, take: limit, ...filters } });
    return {
      leads: response.data.data || [],
      total: response.data.total || 0,
    };
  },

  async getById(id: string): Promise<Lead> {
    const response = await api.get(`/leads/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Lead>): Promise<Lead> {
    const response = await api.post('/leads', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Lead>): Promise<Lead> {
    const response = await api.put(`/leads/${id}`, data);
    return response.data.data;
  },

  async delete(id: string, reason: string): Promise<void> {
    await api.delete(`/leads/${id}`, { data: { reason } });
  },

  async getDeletionLogs(): Promise<any[]> {
    const response = await api.get('/leads/deletion-logs');
    return response.data.data || [];
  },

  async importLeads(leads: any[]): Promise<{ created: number; skipped: number; failed: number; total: number }> {
    const response = await api.post('/leads/import', { leads });
    return response.data;
  },

  async search(query: string): Promise<Lead[]> {
    const response = await api.get(`/leads/search/${query}`);
    return response.data.data || [];
  },

  async getActivity(leadId: string): Promise<any[]> {
    const response = await api.get(`/leads/${leadId}/activity`);
    return response.data.data || [];
  },
};

export const kanbanService = {
  async getCards(): Promise<any[]> {
    const response = await api.get('/kanban');
    return response.data.data || [];
  },

  async moveCard(cardId: string, data: { sector: string; stage: string; position: number }): Promise<any> {
    const response = await api.put(`/kanban/${cardId}`, data);
    return response.data.data;
  },

  async updateCardNotes(cardId: string, notes: string): Promise<any> {
    const response = await api.put(`/kanban/${cardId}`, { notes });
    return response.data.data;
  },

  async deleteCard(cardId: string): Promise<void> {
    await api.delete(`/kanban/${cardId}`);
  },

  async createCardFromLead(leadId: string, sector: string = 'COMMERCIAL', stage?: string): Promise<any> {
    const response = await api.post(`/kanban/lead/${leadId}`, { sector, stage });
    return response.data.data;
  },

  async getConfig(): Promise<any> {
    const response = await api.get('/kanban/config');
    return response.data.data || {};
  },

  async saveConfig(config: any): Promise<void> {
    await api.put('/kanban/config', config);
  },
};

export const taskService = {
  async getByLead(leadId: string): Promise<LeadTask[]> {
    const response = await api.get(`/tasks/lead/${leadId}`);
    return response.data.data || [];
  },

  async create(leadId: string, data: { title: string; description?: string; dueDate?: string; file?: File }): Promise<LeadTask> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.dueDate) formData.append('dueDate', data.dueDate);
    if (data.file) formData.append('file', data.file);

    const response = await api.post(`/tasks/lead/${leadId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async update(taskId: string, data: Partial<{ title: string; description: string; dueDate: string | null; completed: boolean }>): Promise<LeadTask> {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data.data;
  },

  async delete(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },
};
