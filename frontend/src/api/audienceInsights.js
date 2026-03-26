import api from './config';

export const audienceInsightsAPI = {
  async getInsights(metric = 'follower_demographics') {
    const response = await api.get('/audience-insights', {
      params: { metric }
    });
    return response.data;
  }
};
