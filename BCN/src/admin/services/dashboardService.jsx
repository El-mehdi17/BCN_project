import api from './api';

class DashboardService {
  async getStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  }
}

export default new DashboardService();