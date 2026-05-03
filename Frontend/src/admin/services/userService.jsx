import api from './api';

class UserService {
    async getUsers(params = {}) {
    const response = await api.get('/admin/utilisateurs', { params });
    return response.data;
  }

  async getUser(id) {
    const response = await api.get(`/admin/utilisateurs/${id}`);
    return response.data;
  }

  async deleteUser(id) {
    const response = await api.delete(`/admin/utilisateurs/${id}`);
    return response.data;
  }

  async getAdmins() {
    const response = await api.get('/admin/admins');
    return response.data;
  }
  async getcountUsers(){
   try{
    const response = await api.get('/admin/clients/count');
   
    return response.data.client_count||0;
    }catch(error){
      console.error('❌ Erreur getcountUsers:', error);
      return { success: false, stats: { total: 0 } };
    }
  }
 async clientsPerMonth() {
  try {
    const response = await api.get('/admin/clients/per-month');

    const data = response.data.data || [];

    if (data.length < 2) return 0;

    const current = data[data.length - 1].client_count;
    const previous = data[data.length - 2].client_count;

    if (previous === 0) return 100;

    const growth = ((current - previous) / previous) * 100;

    return growth.toFixed(1) 

  } catch (error) {
    console.error('❌ Erreur clientsPerMonth:', error);
    return 0;
  }
}

async getClients(){
  try{
    const response = await api.get('/admin/clients');

    return response.data.clients || [];
  }catch(error){
    console.error('❌ Erreur getClients:', error);
    return { success: false, stats: { total: 0 } };
  }
}

  async createAdmin(adminData) {
    const response = await api.post('/admin/admins', adminData);
    return response.data;
  }

 
  async deleteAdmin(id) {
    const response = await api.delete(`/admin/admins/${id}`);
    return response.data;
  }
}

export default new UserService();