// BCN_admin/src/services/eventService.js
import api from './api';

class EventService {
  /**
   * ✅ Récupérer tous les événements (Admin)
   */
  async getEvents(params = {}) {
    try {
      const response = await api.get('/admin/evenements', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getEvents:', error);
      throw error;
    }
  }
 async getCountPART(id){
try{
   let response = await api.get(`/admin/evenements/${id}/participants/count`);
   console.log('📊 Nombre de participants:', response.data);
   return response.data;

}catch(error){
  console.error('❌ Erreur getCountPART:', error);
}
 }
  /**
   * ✅ Récupérer un événement par ID (Admin)
   */
  async getEvent(id) {
    try {
      const response = await api.get(`/admin/evenements/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getEvent:', error);
      throw error;
    }
  }

  /**
   * ✅ Récupérer les événements publics (sans auth)
   */
  async getPublicEvents(params = {}) {
    try {
      const response = await api.get('/evenements', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getPublicEvents:', error);
      return { data: [] };
    }
  }

  /**
   * ✅ Créer un événement
   */
  async createEvent(data) {
    try {
      const formData = new FormData();

      // Champs obligatoires
      formData.append('titre', data.titre);
      formData.append('date', data.date);
      
      // Champs optionnels
      formData.append('description', data.description || '');
      formData.append('lieu', data.lieu || 'À confirmer');
      formData.append('prix', data.prix || '0');
      formData.append('typePrix', data.typePrix || 'gratuit');
      formData.append('capaciteMax', data.capaciteMax || '50');

      // ✅ Gestion de l'image (Fichier OU URL)
      if (data.imageUrl) {
        if (data.imageUrl instanceof File) {
          // C'est un fichier à uploader
          formData.append('imageUrl', data.imageUrl);
          console.log('📸 Image fichier ajoutée:', data.imageUrl.name);
        } else if (typeof data.imageUrl === 'string') {
          // C'est une URL
          formData.append('imageUrl', data.imageUrl);
          console.log('🔗 Image URL ajoutée:', data.imageUrl);
        }
      }

      console.log('📤 Création événement...');
      
      const response = await api.post('/admin/evenements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Événement créé:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Erreur createEvent:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        errors: error.response?.data?.errors
      });
      throw error;
    }
  }

  /**
   * ✅ Mettre à jour un événement
   */
  async updateEvent(id, eventData) {
    try {
      const isFormData = eventData instanceof FormData;
      
      console.log('📤 Mise à jour événement:', {
        id,
        isFormData,
        url: `/admin/evenements/${id}`
      });

      const config = {
        headers: isFormData 
          ? { 'Content-Type': 'multipart/form-data' } 
          : {}
      };

      const response = await api.put(`/admin/evenements/${id}`, eventData, config);
      
      console.log('✅ Événement mis à jour:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Erreur updateEvent:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      throw error;
    }
  }

  /**
   * ✅ Supprimer un événement
   */
  async deleteEvent(id) {
    try {
      console.log('🗑️ Suppression événement:', id);
      const response = await api.delete(`/admin/evenements/${id}`);
      console.log('✅ Événement supprimé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur deleteEvent:', error);
      throw error;
    }
  }

  /**
   * ✅ Récupérer les participants d'un événement
   */
  async getParticipants(eventId, params = {}) {
    try {
      const response = await api.get(`/admin/evenements/${eventId}/participants`, { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getParticipants:', error);
      throw error;
    }
  }

  /**
   * ✅ Compter les participants d'un événement
   */
  async getCountParticipants(eventId) {
    try {
      const response = await api.get(`/admin/evenements/${eventId}/participants/count`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getCountParticipants:', error);
      return { success: false, stats: { total: 0 } };
    }
  }

  /**
   * ✅ Mettre à jour le statut d'un participant
   */
  async updateParticipationStatus(participationId, statut) {
    try {
      const response = await api.patch(`/admin/participations/${participationId}/statut`, { statut });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateParticipationStatus:', error);
      throw error;
    }
  }

  /**
   * ✅ Supprimer un participant
   */
  async deleteParticipant(participantId) {
    try {
      const response = await api.delete(`/admin/participants/${participantId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur deleteParticipant:', error);
      throw error;
    }
  }

  /**
   * ✅ Mes participations (Client)
   */
  async getMyParticipations() {
    try {
      console.log('📤 Récupération des participations...');
      const response = await api.get('/my-participations');
      console.log('📥 Participations reçues');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Erreur getMyParticipations:', {
        status: error.response?.status,
        message: error.response?.data?.message
      });
      throw error;
    }
  }

  /**
   * ✅ S'inscrire à un événement
   */
  async registerToEvent(eventId) {
    try {
      const response = await api.post(`/evenements/${eventId}/register`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur registerToEvent:', error);
      throw error;
    }
  }

  /**
   * ✅ Annuler une participation
   */
  async cancelParticipation(eventId) {
    try {
      const response = await api.post(`/evenements/${eventId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur cancelParticipation:', error);
      throw error;
    }
  }

  /**
   * ✅ Upload d'image pour événement
   */
  async uploadEventImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/admin/upload-event-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erreur uploadEventImage:', error);
      throw error;
    }
  }

  /**
   * ✅ Récupérer les statistiques des événements
   */
  async getEventStats() {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur getEventStats:', error);
      return {
        total_evenements: 0,
        total_participants: 0
      };
    }
  }

  /**
   * ✅ Compter le nombre total d'événements
   */
  async getCountEvenements() {
    try {
      const response = await api.get('/admin/evenements', { params: { per_page: 1 } });
      
      // Extraire le total de la pagination Laravel
      const total = response.data?.data?.total || 
                    response.data?.total || 
                    response.data?.data?.data?.length || 
                    0;
      
      
      return total;
    } catch (error) {
      console.error('❌ Erreur getCountEvenements:', error);
      return 0;
    }
  }

  /**
   * ✅ Récupérer le dernier ID (utilisé pour nommer les images)
   */
  async getLastEventId() {
    try {
      const response = await api.get('/admin/evenements', {
        params: { per_page: 1, order_by: 'id', order_direction: 'desc' }
      });
      
      const events = response.data?.data?.data || [];
      const lastId = events.length > 0 ? events[0].id : 0;
      
      console.log('🆔 Dernier ID événement:', lastId);
      return lastId + 1; // Retourne le prochain ID
    } catch (error) {
      console.error('❌ Erreur getLastEventId:', error);
      return Date.now(); // Fallback: timestamp
    }
  }
}

export default new EventService();