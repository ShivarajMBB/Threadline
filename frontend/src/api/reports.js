import api from './config';

export const reportsAPI = {
  async getReports(params = {}) {
    const response = await api.get('/reports', { params });
    return response.data.reports;
  },

  async createReport(data) {
    const response = await api.post('/reports', data);
    return response.data.report;
  },

  async updateReport(id, data) {
    const response = await api.patch(`/reports/${id}`, data);
    return response.data.report;
  },

  async archiveReport(id) {
    const response = await api.delete(`/reports/${id}`);
    return response.data.report;
  }
};
