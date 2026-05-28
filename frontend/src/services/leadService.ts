import api from './api';
import { Lead } from '@/types';

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

  async delete(id: string): Promise<void> {
    await api.delete(`/leads/${id}`);
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

  async createCardFromLead(leadId: string, sector: string = 'COMMERCIAL'): Promise<any> {
    const response = await api.post(`/kanban/lead/${leadId}`, { sector });
    return response.data.data;
  },
};
