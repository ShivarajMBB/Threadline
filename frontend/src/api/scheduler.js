import api from './config';

export const schedulerAPI = {
  async getPosts(params = {}) {
    const response = await api.get('/scheduler/posts', { params });
    return response.data.posts;
  },

  async createPost(data) {
    const response = await api.post('/scheduler/posts', data);
    return response.data;
  },

  async publishPost(id) {
    const response = await api.post(`/scheduler/posts/${id}/publish`);
    return response.data;
  },

  async deletePost(id) {
    const response = await api.delete(`/scheduler/posts/${id}`);
    return response.data;
  }
};
