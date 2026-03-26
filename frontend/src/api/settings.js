import api from './config';

export const settingsAPI = {
  async getSettings() {
    const response = await api.get('/settings');
    return response.data.settings;
  },

  async updateAcknowledgment(enabled, message) {
    const response = await api.patch('/settings/acknowledgment', {
      enabled,
      message
    });
    return response.data.settings;
  },

  async disconnectInstagram() {
    const response = await api.post('/settings/disconnect-instagram');
    return response.data;
  },

  async getCommentAutomations() {
    const response = await api.get('/settings/comment-automations');
    return response.data.automations;
  },

  async saveCommentAutomations(automations) {
    const response = await api.put('/settings/comment-automations', { automations });
    return response.data.automations;
  }
};
