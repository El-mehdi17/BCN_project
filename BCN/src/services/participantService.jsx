// src/services/participantService.js
import api from './api';

const REGISTER=import.meta.env.VITE_REGISTER
const EVENTS=import.meta.env.ITE_EVENTS
const CANCEL=import.meta.env.VITE_CANCEL_EVENT
const MPARTICIPATIONS=import.meta.env.VITE_MY_PARTICIPATIONS
const PARTICIPATIONS=import.meta.env.VITE_PARTICIPATIONS
class ParticipantService {
  
  async registerForEvent(eventId) {
    try {
      const response = await api.post(`${EVENTS}/${eventId}/${REGISTER}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelRegistration(eventId) {
    try {
      const response = await api.post(`${EVENTS}/${eventId}${CANCEL}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

    async getMyParticipations() {
    try {
      const response = await api.get(MPARTICIPATIONS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

 
  async getEventParticipants(eventId) {
    try {
      const response = await api.get(`${EVENTS}/${eventId}${PARTICIPATIONS}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  
  async updateParticipantStatus(participantId, status) {
    try {
      const response = await api.put(`${PARTICIPATIONS}/${participantId}/status`, { statut: status });
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

export default new ParticipantService();