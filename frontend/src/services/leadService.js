import api from './api';
export const leadService = {
    async getAll(page = 1, limit = 20, filters) {
        const response = await api.get('/leads', { params: { skip: (page - 1) * limit, take: limit, ...filters } });
        return {
            leads: response.data.data || [],
            total: response.data.total || 0,
        };
    },
    async getById(id) {
        const response = await api.get(`/leads/${id}`);
        return response.data.data;
    },
    async create(data) {
        const response = await api.post('/leads', data);
        return response.data.data;
    },
    async update(id, data) {
        const response = await api.put(`/leads/${id}`, data);
        return response.data.data;
    },
    async delete(id) {
        await api.delete(`/leads/${id}`);
    },
    async search(query) {
        const response = await api.get(`/leads/search/${query}`);
        return response.data.data || [];
    },
    async getActivity(leadId) {
        const response = await api.get(`/leads/${leadId}/activity`);
        return response.data.data || [];
    },
};
export const kanbanService = {
    async getCards() {
        const response = await api.get('/kanban');
        return response.data.data || [];
    },
    async moveCard(cardId, data) {
        const response = await api.put(`/kanban/${cardId}`, data);
        return response.data.data;
    },
    async updateCardNotes(cardId, notes) {
        const response = await api.put(`/kanban/${cardId}`, { notes });
        return response.data.data;
    },
    async deleteCard(cardId) {
        await api.delete(`/kanban/${cardId}`);
    },
    async createCardFromLead(leadId, sector = 'COMMERCIAL', stage) {
        const response = await api.post(`/kanban/lead/${leadId}`, { sector, stage });
        return response.data.data;
    },
};

export const taskService = {
    async getByLead(leadId) {
        const response = await api.get(`/tasks/lead/${leadId}`);
        return response.data.data || [];
    },
    async create(leadId, data) {
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
    async update(taskId, data) {
        const response = await api.put(`/tasks/${taskId}`, data);
        return response.data.data;
    },
    async delete(taskId) {
        await api.delete(`/tasks/${taskId}`);
    },
};
