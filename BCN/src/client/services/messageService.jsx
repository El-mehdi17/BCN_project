// src/services/messageService.js
import api from './api';

class MessageService {
  
  async getConversations() {
    try {
      const response = await api.get('/messages');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // GET /messages/conversation/{userId} 
  async getConversation(userId, page = 1) {
    try {
      const response = await api.get(`/messages/conversation/${userId}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST /messages
  async sendMessage(destinataire_id, contenu) {
    try {
      const response = await api.post('/messages', {
        destinataire_id,
        contenu
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT /messages/{messageId}/read -
  async markAsRead(messageId) {
    try {
      const response = await api.put(`/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // GET /messages/unread-count
  async getUnreadCount() {
    try {
      const response = await api.get('/messages/unread-count');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE /messages/{messageId}
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // GET /users/search 
  async searchUsers(query) {
    try {
      const response = await api.get('/users/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

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

export default new MessageService();