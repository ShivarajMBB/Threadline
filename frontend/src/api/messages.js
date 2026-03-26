import api from './config';

export const messagesAPI = {
  async getConversations() {
    const response = await api.get('/messages/conversations');
    return response.data.conversations;
  },

  async getConversation(id) {
    const response = await api.get(`/messages/conversation/${id}`);
    return response.data.conversation;
  },

  async sendMessage(conversationId, message) {
    const response = await api.post('/messages/send', {
      conversationId,
      message
    });
    return response.data;
  },

  async getStats() {
    const response = await api.get('/messages/stats');
    return response.data.stats;
  }
};
