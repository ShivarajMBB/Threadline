import api from './config';

export const contentPlannerAPI = {
  async getItems(params = {}) {
    const response = await api.get('/content-planner', { params });
    return response.data.items;
  },

  async getStats() {
    const response = await api.get('/content-planner/stats/overview');
    return response.data.stats;
  },

  async createItem(data) {
    const response = await api.post('/content-planner', data);
    return response.data.item;
  },

  async updateItem(id, data) {
    const response = await api.patch(`/content-planner/${id}`, data);
    return response.data.item;
  },

  async archiveItem(id) {
    const response = await api.delete(`/content-planner/${id}`);
    return response.data.item;
  }
};
