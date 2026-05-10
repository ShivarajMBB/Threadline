import api from './config';

export const socialAnalyzerAPI = {
  async getOverview(params = {}) {
    const response = await api.get('/social-analyzer/overview', { params });
    return response.data;
  },

  async syncInstagram(limit = 50) {
    const response = await api.post('/social-analyzer/sync/instagram', { limit });
    return response.data;
  },

  async getWeeklyReport(days = 7, save = false, params = {}) {
    const response = await api.get('/social-analyzer/weekly-report', {
      params: { days, save, ...params }
    });
    return response.data;
  }
};
