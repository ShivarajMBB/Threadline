import api from './config';

export const salesPagesAPI = {
  async getPages(params = {}) {
    const response = await api.get('/sales-pages', { params });
    return response.data.salesPages;
  },

  async getPage(id) {
    const response = await api.get(`/sales-pages/${id}`);
    return response.data.salesPage;
  },

  async createPage(data) {
    const response = await api.post('/sales-pages', data);
    return response.data;
  },

  async updatePage(id, data) {
    const response = await api.patch(`/sales-pages/${id}`, data);
    return response.data.salesPage;
  },

  async deletePage(id) {
    const response = await api.delete(`/sales-pages/${id}`);
    return response.data;
  },

  async trackView(slug) {
    const response = await api.post(`/sales-pages/${slug}/view`);
    return response.data;
  }
};
