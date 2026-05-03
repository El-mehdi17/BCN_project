// BCN_admin/src/dashboard/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaEnvelope, FaChartBar } from 'react-icons/fa';
import '../css/AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    messages: 0
  });
  
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
  useEffect(() => {
    // Charger les statistiques
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      // Appel API pour les stats
      // const response = await api.get('/admin/statistics');
      // setStats(response.data);
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };
  
  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header">
        <h1>Bienvenue, {user.nomComplet || 'Administrateur'} !</h1>
        <p>Voici votre tableau de bord d'administration BCN</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon events">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>{stats.events}</h3>
            <p>Événements</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon messages">
            <FaEnvelope />
          </div>
          <div className="stat-info">
            <h3>{stats.messages}</h3>
            <p>Messages</p>
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <button onClick={() => navigate('/admin/evenements')}>
          <FaCalendarAlt /> Gérer les événements
        </button>
        <button onClick={() => navigate('/admin/membres')}>
          <FaUsers /> Gérer les membres
        </button>
        <button onClick={() => navigate('/admin/messages')}>
          <FaEnvelope /> Voir les messages
        </button>
        <button onClick={() => navigate('/admin/statistiques')}>
          <FaChartBar /> Voir les statistiques
        </button>
      </div>
    </div>
  );
}