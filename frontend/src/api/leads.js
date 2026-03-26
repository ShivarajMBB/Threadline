import api from './config';

export const leadsAPI = {
  async getLeads(params = {}) {
    const response = await api.get('/leads', { params });
    return response.data.leads;
  },

  async getLead(id) {
    const response = await api.get(`/leads/${id}`);
    return response.data.lead;
  },

  async updateLead(id, data) {
    const response = await api.patch(`/leads/${id}`, data);
    return response.data.lead;
  },

  async getStats() {
    const response = await api.get('/leads/stats/overview');
    return response.data.stats;
  }
};
