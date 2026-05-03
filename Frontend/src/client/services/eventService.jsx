// src/services/eventService.js - BCN_client (version sans /client)
import api from './api';

const EVENTS=import.meta.env.VITE_EVENTS
const CANCEL=import.meta.env.VITE_EVENTS_CANCEL
const P=import.meta.env.VITE_MY_PARTICIPATIONS
const STATISTIC=import.meta.env.VITE_STATISTICS

class EventService {
  async getEvents(filters = {}) {
    try {
      const response = await api.get(EVENTS, { params: filters });
      return response.data;
    } catch (error) {
        console.error('Failed to fetch events:', error);
    throw new Error('Unable to load events. Please try again.');
    }
  }

  async getEvent(id) {
    try {
      const response = await api.get(`${EVENTS}/${id}`);
      return response.data;
    } 
    catch (error) {
      console.error(`Failed to fetch event with ID ${id}:`, error);
      throw new Error('Unable to load event details. Please try again.');
    }
  }
   async getData() {
    try {
      const response = await api.get(EVENTS);
     return response.data?.data?.data || response.data?.data || response.data || []
    } catch (err) {
      console.error("❌ Erreur getData:", err);
      return [];
    }
  }
  async getCountEvenement() {
  try {
    const response = await api.get(EVENTS);
    
    console.log('📊 Structure réponse:', response.data.data.data);
    
   
    const count = 
      response.data.meta?.total ||           // Laravel pagination
      response.data.total ||                 // Total direct
      response.data.data?.length ||          // Resource collection
      (Array.isArray(response.data) ? response.data.length : 0); // Array direct
    
    console.log('✅ Nombre d\'événements:', count)
    return count;
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    return 0;
  }
}

 async registerForEvent(eventId) {
  try {
    const response = await api.post(`${EVENTS}/${eventId}/register`);
    return response.data;
  } catch (error) {
    console.error(
      `Failed to register for event ${eventId}:`,
      error.response?.data || error.message
    );

    throw error;
  }
}

  async cancelRegistration(eventId) {
    try {
      const response = await api.post(`${EVENTS}/${eventId}${CANCEL}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to cancel registration for event with ID ${eventId}:`, error);
      throw new Error('Unable to cancel registration. Please try again.');
    }
  }

  async getMyParticipations() {
    try {
      const response = await api.get(P);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch my participations:', error);
      throw new Error('Unable to load participations. Please try again.');
    }
  }

  async getStatistics() {
    try {
      const response = await api.get(STATISTIC);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw new Error('Unable to load statistics. Please try again.');
    }
  }
}

export default new EventService();