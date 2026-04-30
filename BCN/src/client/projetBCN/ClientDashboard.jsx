// ClientDashboard.jsx
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaComments, 
  FaUser, 
  FaChartBar,
  FaArrowRight,
  FaMapMarkerAlt,
  FaEnvelope,
  FaBell,
  FaUsers,
  FaTicketAlt,
  FaShoppingCart
} from 'react-icons/fa';
import { CalendarRange } from 'lucide-react';
import api from '../services/api';
import eventService from '../services/eventService';
import authService from '../services/authService';
import { decodeSlug } from '../utils/urlHelper';
import {useDispatch, useSelector} from "react-redux";
import { setUser } from '../redux/redux';
import "./css/ClientDA.css";
import { FaCalendarWeek } from 'react-icons/fa6';

const dashboardApi=import.meta.env.VITE_API_DASHBOARD
const testDashboardApi=import.meta.env.VITE_API_TEST_DASHBOARD
const storageUrl=import.meta.env.VITE_STORAGE_URL

function ClientDashboard() {
  const { nomComplet } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [evenements, setEvenements] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [registeringEvent, setRegisteringEvent] = useState(null);
let userww = useSelector(state => state.auth.user);

  useEffect(() => {
    loadAllData();
  }, [nomComplet]);

 let dispatch=useDispatch();
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboard(),
        loadEvents()
      ]);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };


  const fetchDashboard = async () => {
    try {
      const response = await api.get(`${dashboardApi}/${decodeSlug(nomComplet)}/dashboard`);
      dispatch(setUser(response.data.user));
      setDashboard(response.data);
    } catch (err) {
      try {
        const testResponse = await api.get(`${testDashboardApi}`);
        setDashboard(testResponse.data);
      } catch (testErr) {
        if (testErr.response?.status === 401) {
          setError('Session expirée, veuillez vous reconnecter');
        } else {
          setError('Erreur lors du chargement du dashboard');
        }
      }
    }
  };



  const loadEvents = async () => {
    try {
      const [eventsRes, participationsRes] = await Promise.all([
        eventService.getEvents(),
        eventService.getMyParticipations()
      ]);
      
      const eventsData = eventsRes?.data?.data ?? eventsRes?.data ?? [];
      setEvenements(eventsData);

      const participationsData = participationsRes?.data ?? participationsRes ?? [];
      setMyParticipations(participationsData);
      
    } catch (err) {
      console.error('Erreur chargement événements:', err);
    }
  };


  const handleRegister = async (eventId) => {
    setRegisteringEvent(eventId);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await eventService.registerForEvent(eventId);
      if (response.success) {
        setSuccessMessage('✅ Inscription réussie !');
        await loadEvents();
        await fetchDashboard();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setRegisteringEvent(null);
      setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 3000);
    }
  };


  const handleCancel = async (eventId) => {
    if (!window.confirm('Voulez-vous vraiment annuler votre inscription ?')) {
      return;
    }
    
    setRegisteringEvent(eventId);
    try {
      const response = await eventService.cancelRegistration(eventId);
      if (response.success) {
        setSuccessMessage('✅ Inscription annulée');
        await loadEvents();
        await fetchDashboard();
      }
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    } finally {
      setRegisteringEvent(null);
      setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 3000);
    }
  };

 let [cas,setCas]=useState("")
const isRegistered = (eventId) => {
  return myParticipations.data?.some(
    p =>
      p.evenement_id === eventId &&
      p.statut !== "annulé"
  ) || false;
};

  // ✅Calculer les places restantes
  const getRemainingSpots = (event) => {
    const registered = event.nbParticipants || 0;
    const max = event.capaciteMax || 50;
    return max - registered;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement de votre espace...</p>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="error-container">
        <h2><FaBell /> Erreur</h2>
        <p>{error}</p>
        <Link to="/">← Retour à l'accueil</Link>
      </div>
    );
  }

  if (!dashboard) return null;

  const { user, stats, derniers_messages } = dashboard;
  const displayName = user.nomComplet || decodeSlug(nomComplet);
let evenements_dans_ce_mois = evenements.filter(ev => {
  const eventDate = new Date(ev.date);
  const now = new Date();
  return (eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear());
})




const e =(myParticipations.data?.filter(
    p => p.statut === "en_attente" 
  ).length || 0);


 
  return (
    <div className="dashboard-client">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="user-profile">
          <img 
            src={user.photoUrl || '/default-avatar.png'} 
            alt={displayName}
            className="user-avatar"
          />
          <h3>{displayName}</h3>
          <p className="user-role">{user.role}</p>
          <p className="user-email">
            <FaEnvelope style={{ marginRight: '5px', fontSize: '12px' }} />
            {user.email}
          </p>
        </div>
        
       
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Bienvenue, {displayName} ! 👋</h1>
          <p className="welcome-message">Voici votre espace personnel BCN</p>
        </header>

        {/* Messages */}
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {/* Statistiques */}
        <section className="stats-section">
          <h2><FaChartBar style={{ marginRight: '10px' }} />Vue d'ensemble</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FaCalendarAlt /></div>
              <div className="stat-info">
                <h3>{evenements.length}</h3>
                <p>Événements disponibles</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><FaCheckCircle /></div>
              <div className="stat-info">
                <h3>{e}</h3>
                <p>Mes participations</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><CalendarRange /></div>
              <div className="stat-info">
                <h3>{evenements_dans_ce_mois.length}</h3>
                <p>Événements à ce mois </p>
                  <p> {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Événements */}
        <section className="evenements-section">
          <div className="section-header">
            <h2><FaCalendarAlt style={{ marginRight: '10px' }} />Événements à venir</h2>
            <Link to={`/client/${nomComplet}/evenements`} className="see-all">
              Voir tout <FaArrowRight style={{ marginLeft: '5px' }} />
            </Link>
          </div>
          
          <div className="events-grid">
            {evenements_dans_ce_mois.length > 0 ? (
              evenements_dans_ce_mois.map(event => (
                <div key={event.id} className="event-card">
                  <img 
                    src={
                             event.imageUrl
                             ? event.imageUrl.startsWith("http")
                             ? event.imageUrl
                             : `${storageUrl}/${event.imageUrl}`
                             : "/default-event.jpg"
                        } 
                    alt={event.titre}
                    className="event-image"
                  />
                  
                  <div className="event-content">
                    <h3>{event.titre}</h3>
                    <p>{event.description?.substring(0, 100)}...</p>
                    
                    <div className="event-info">
                      <span><FaCalendarAlt /> {new Date(event.date).toLocaleDateString('fr-FR')}</span>
                      <span><FaMapMarkerAlt /> {event.lieu || 'Lieu à confirmer'}</span>
                      <span><FaUsers /> {getRemainingSpots(event)} places</span>
                    </div>
                    
                    <div className="event-price">
                      {event.prix > 0 ? `${event.prix} DH` : event.prix ===0? "Gratuit":"Prix à confirmer"}
                    </div>
                    
                    <div className="event-actions">
                      { userww?.profileCompleted === true ? isRegistered(event.id) ? (
                        <button 
                          className="btn-cancel"
                          onClick={() => handleCancel(event.id)}
                          disabled={registeringEvent === event.id}
                        >
                          <FaCheckCircle /> Inscrit - Annuler
                        </button>
                      ) : getRemainingSpots(event) > 0 ? (
                        <button 
                          className="btn-register"
                          onClick={() => handleRegister(event.id)}
                          disabled={registeringEvent === event.id}
                        >
                          {event.prix > 0 ? (
                            <><FaShoppingCart /> Acheter </>
                          ) : (
                            <><FaTicketAlt /> S'inscrire</>
                          )}
                        </button>
                      ) : (
                        <button className="btn-full" disabled>
                          Complet
                        </button>
                      ):(
                        <button className="btn-incomplete" disabled>
                          Complétez votre profil pour vous inscrire
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">Aucun événement disponible</p>
            )}
          </div>
        </section>

        {/* Messages récents */}
       
      </main>
    </div>
  );
}

export default ClientDashboard;