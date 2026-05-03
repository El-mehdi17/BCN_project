// src/services/authService.js
import api from './api';

const taketoken = import.meta.env.VITE_TAKE_TOKEN;
const respass=import.meta.env.VITE_res_pass
const motpass=import.meta.env.VITE_MOTdePASS
class AuthService {
  async registerAdmin(adminData) {
    try {
     
        const response = await api.post('/register', adminData);
      if (response.data.access_token) {
        
        localStorage.setItem('admin_access_token', response.data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
      }
     
      return response.data;
    } catch (error) {
      console.error('❌ Erreur registerAdmin:', error);
      throw error;
    }
  }

  async adminLogin(email, password,role) {
    try {
       const response= await api.post("/login",{
          email, 
          password, 
          role 
       })
       if (response.data.access_token) {
     
      localStorage.setItem('admin_access_token', response.data.access_token);
      
      
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
      
      
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
      return response.data;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  }

  async getCurrentUser() {
     try {
      const response = await api.get('/me');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    delete api.defaults.headers.common['Authorization'];
  }
   async  Take_token(email) {
  try {

    const response = await api.post(taketoken, {
      email: email
    });

    console.log(response.data.token);

    return response.data;

  } catch (err) {

    console.log("🗝️ problème take Token", err);

    throw err;
  }
}
async resetPassword(token, email, password, password_confirmation) {
    try {
      const res = await api.post(respass, {
        token,
      email,
      password,
      password_confirmation
      });

      return res.data;

    } catch (error) {
      throw error.response?.data || {
        message: "Erreur serveur"
      };
    }
  }
  async MOTdepass(email, password, password_confirmation)
{
   try {
    const res = await api.post(motpass, {
      email,
      password,
      password_confirmation
    });

    return res.data;

  } catch (error) {
    throw error.response?.data || {
      message: "Erreur serveur"
    };
  }
}
}

export default new AuthService();