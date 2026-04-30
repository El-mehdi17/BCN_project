// src/services/authService.js
import api from './api';

const taketoken = import.meta.env.VITE_TAKE_TOKEN;
const acces_token=import.meta.env.VITE_access_token;
const user_local=import.meta.env.VITE_USER
//const email_remember=import.meta.env.VITE_remembered_email
const TERi=import.meta.env.VITE_REGISTER
const login=import.meta.env.VITE_login
const logout=import.meta.env.VITE_logout
const me=import.meta.env.VITE_me
const bre=import.meta.env.VITE_bre
const forpass=import.meta.env.VITE_for_pass
const respass=import.meta.env.VITE_res_pass
const chanpass=import.meta.env.VITE_chan_pass
class AuthService {
  // ==================== AUTH ROUTES ====================
  
  // POST /register -Enregistrez un nouvel utilisateur
  async register(userData) {
    try {
      const response = await api.post(TERi, userData);
      if (response.data.access_token) {
        localStorage.setItem(acces_token, response.data.access_token);
        localStorage.setItem(user_local, JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  //POST /login - Connexion
 async login(email, password, role) {
  try {
    const response = await api.post(login, { 
      email, 
      password, 
      role 
    });
      
    if (response.data.access_token) {
     
      localStorage.setItem(acces_token, response.data.access_token);
      
      
      localStorage.setItem(user_local, JSON.stringify(response.data.user));
      
      
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    }
    
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}
 
  async logout() {
    try {
      const response = await api.post(logout);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      localStorage.removeItem(acces_token);
      localStorage.removeItem(user_local);
    }
  }

  
  async getCurrentUser() {
    try {
      const response = await api.get(me);
      localStorage.setItem(user_local, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT /profile 
  async updateProfile(profileData) {
    try {
      const response = await api.put(bre, profileData);
      localStorage.setItem(user_local, JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== PASSWORD ROUTES ====================
  
  // POST /forgot-password -
   async forgotPassword(email) {
    try {
      const res = await api.post(forpass, {
        email
      });

      return res.data;

    } catch (error) {
      throw error.response?.data || {
        message: "Erreur serveur"
      };
    }
  }

  // reset password
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
  // PUT /change-password - 
  async changePassword(current_password, new_password, new_password_confirmation) {
    try {
      const response = await api.put(chanpass, {
        current_password,
        new_password,
        new_password_confirmation
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
 

  // ==================== GOOGLE OAUTH ====================
  

  redirectToGoogle() {
    window.location.href = 'http://localhost:8000/api/auth/google';
  }

 
  async handleGoogleCallback(token) {
    localStorage.setItem(acces_token, token);
    const user = await this.getCurrentUser();
    return user;
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

  // ==================== ERROR HANDLER ====================
  
  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.message || 'Une erreur est survenue',
        errors: error.response.data.errors
      };
    }
    return {
      status: 500,
      message: 'Erreur de connexion au serveur'
    };
  }
}

export default new AuthService();