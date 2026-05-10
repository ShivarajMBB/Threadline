import api from './config';

export const clientsAPI = {
  async getClients(params = {}) {
    const response = await api.get('/clients', { params });
    return response.data.clients;
  },

  async getStats() {
    const response = await api.get('/clients/stats/overview');
    return response.data.stats;
  },

  async createClient(data) {
    const response = await api.post('/clients', data);
    return response.data.client;
  },

  async updateClient(id, data) {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data.client;
  },

  async archiveClient(id) {
    const response = await api.delete(`/clients/${id}`);
    return response.data.client;
  }
};
