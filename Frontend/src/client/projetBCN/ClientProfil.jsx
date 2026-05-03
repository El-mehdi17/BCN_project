import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaBriefcase,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaKey,
  FaSignOutAlt,
  FaCheckCircle,
  FaSpinner,
  FaPhone,
  FaGlobe,
  FaShieldAlt
} from 'react-icons/fa';
import api from '../services/api';
import axios from 'axios';
import authService from '../services/authService';
import { decodeSlug } from '../utils/urlHelper';
import './css/ClientProfil.css';

const apiDASHBOARD = import.meta.env.VITE_API_DASHBOARD;
const aupdate=import.meta.env.VITE_avatar_update
const access_token=import.meta.env.VITE_access_token;
const user_local=import.meta.env.VITE_USER
const bro=import.meta.env.VITE_bro
const change_pass=import.meta.env.VITE_CHANGE_PASSWORD
const upo=import.meta.env.VITE_upload_photo
const email_remember=import.meta.env.VITE_remembered_email
export default function ClientProfil() {
  const { nomComplet } = useParams();
  const navigate = useNavigate();
  let [getImg, setGetImg] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // États pour le changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [errors, setErrors] = useState(false)
const [previewAvatar, setPreviewAvatar] = useState(null)
const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Formulaire d'édition
  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    ville: '',
    imageUrl: '',
    entrepriseNom: '',
    poste: '',
    telephone: '',
  
  });

  useEffect(() => {
    fetchProfil();
   
  }, [nomComplet]);

const handleAvatarUpload = async (file) => {
  const token = localStorage.getItem(access_token);
  const user = JSON.parse(localStorage.getItem(user_local) || "{}");
    
  const formData = new FormData();
  formData.append("avatar", file);

    const response = await api.post(
    `${apiDASHBOARD}/${user.id}/${aupdate}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data.avatar_url;
};
const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;


  setPreviewAvatar(URL.createObjectURL(file));

  try {
    const url = await handleAvatarUpload(file);

    setPreviewAvatar(url);

    setUser((prev) => ({
      ...prev,
      photoUrl: url,
    }));

    localStorage.setItem(
      user_local,
      JSON.stringify({
        ...user,
        photoUrl: url
      })
    );

  } catch (error) {
    console.error(error);
  }
};  const fetchProfil = async () => {
    try {
      const response = await api.get(`${apiDASHBOARD}/${nomComplet}/${bro}`);
      setUser(response.data.user);
      setFormData({
        nomComplet: response.data.user.nomComplet || '',
        email: response.data.user.email || '',
        ville: response.data.user.ville || '',
        entrepriseNom: response.data.user.entrepriseNom || '',
        poste: response.data.user.poste || '',
        telephone: response.data.user.telephone || '',
        active: response.data.user.profileCompleted === true ? true : false,
        photoUrl: response.data.user.photoUrl || ''
      });
      setGetImg(response.data.user.photoUrl || '');
    
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      setError('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.put(`${apiDASHBOARD}/${nomComplet}/${bro}`, formData);
      setUser(response.data.user);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      
      // Mettre à jour le localStorage
      localStorage.setItem(user_local, JSON.stringify(formData));
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    try {
     

      await api.put(`${apiDASHBOARD}/${nomComplet}/${change_pass}`, passwordData);
      setPasswordSuccess('Mot de passe changé avec succès !');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/', { replace: true });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('photo', file);
    
    try {
      const response = await api.post(`${apiDASHBOARD}/${nomComplet}/${upo}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data.user);
      localStorage.setItem(user_local, JSON.stringify(response.data.user));
      setSuccess('Photo de profil mise à jour !');
    } catch (err) {
      setError('Erreur lors du téléchargement de la photo');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="error-container">
        <h2>⚠️ Erreur</h2>
        <p>{error}</p>
        <Link to="/">Retour à l'accueil</Link>
      </div>
    );
  }

  if (!user) return null;

/**
 * user:{
 * dateInscription
: 
"20xx-0x-xx"
email: "*******1@gmail.com"
entrepriseNom: "name_entreprise"
id: XX
nomComplet: "********li"
photoUrl: "http://localhost:XXXX/x+++++/+++++/+++++/*++++.webp"
poste: "Develppeur FullStack Junior"
profileCompleted: boolean
role: "Client"||"Admin"
telephone: "+212++++++37"
ville: "+++++++++++"
}
 */
  const displayName = user.nomComplet || decodeSlug(nomComplet);

  return (
    <div className="profil-client">
      {/* Sidebar */}
      <aside className="profil-sidebar">
        <div className="user-profile-card">
          <div className="avatar-wrapper">
            <img
  src={previewAvatar || user.photoUrl || getImg || "/default-avatar.png"}
  alt={displayName}
  className="profile-avatar"
/>
            <label htmlFor="photo-upload" className="avatar-upload-btn">
              <FaCamera />
            </label>
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          
          <h2>{displayName}</h2>
          <p className="user-role-badge">{user.role}</p>
          <p className="user-email-profile">
            <FaEnvelope /> {user.email}
          </p>
          
          <div className="profile-completion">
            <div className="completion-bar">
              <div 
                className="completion-fill" 
                style={{ width: `${user.profileCompleted ? '100%' : '60%'}` }}
              ></div>
            </div>
            <p className="completion-text">
              {user.profileCompleted ? (
                <><FaCheckCircle /> Profil complet</>
              ) : (
                'Profil à 60% complété'
              )}
            </p>
          </div>
        </div>
        
       
      </aside>

      {/* Contenu principal */}
      <main className="profil-main">
        <header className="profil-header">
          <h1>
            <FaUser /> Mon Profil
          </h1>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              <FaEdit /> Modifier le profil
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)} className="cancel-btn">
              <FaTimes /> Annuler
            </button>
          )}
        </header>

        {success && (
          <div className="success-message">
            <FaCheckCircle /> {success}
          </div>
        )}
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profil-form">
            <div className="form-grid">
              <div className="form-group">
                <label><FaUser /> Nom complet</label>
                <input
                  type="text"
                  name="nomComplet"
                  value={formData.nomComplet}
                  onChange={handleChange}
                  placeholder="Votre nom complet"
                />
              </div>
              
              <div className="form-group">
                <label><FaEnvelope /> Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  disabled
                />
                <small>L'email ne peut pas être modifié</small>
              </div>
              
              <div className="form-group">
                <label><FaPhone /> Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="+212 6XX XXX XXX"
                />
              </div>
              
              <div className="form-group">
                <label><FaMapMarkerAlt /> Ville</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Votre ville"
                />
              </div>
              
              <div className="form-group">
                <label><FaBuilding /> Entreprise</label>
                <input
                  type="text"
                  name="entrepriseNom"
                  value={formData.entrepriseNom}
                  onChange={handleChange}
                  placeholder="Nom de votre entreprise"
                />
              </div>
              
              <div className="form-group">
                <label><FaBriefcase /> Poste</label>
                <input
                  type="text"
                  name="poste"
                  value={formData.poste}
                  onChange={handleChange}
                  placeholder="Votre poste"
                />
              </div>
              
          
              
           
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? <FaSpinner className="spinner-icon" /> : <FaSave />}
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profil-view">
            <div className="info-grid">
              <div className="info-card">
                <div className="info-header">
                  <FaUser />
                  <h3>Informations personnelles</h3>
                </div>
                <div className="info-content">
                  <div className="info-row">
                    <span className="info-label">Nom complet</span>
                    <span className="info-value">{user.nomComplet || 'Non renseigné'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Téléphone</span>
                    <span className="info-value">{user.telephone || 'Non renseigné'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ville</span>
                    <span className="info-value">{user.ville || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-header">
                  <FaBuilding />
                  <h3>Informations professionnelles</h3>
                </div>
                <div className="info-content">
                  <div className="info-row">
                    <span className="info-label">Entreprise</span>
                    <span className="info-value">{user.entrepriseNom || 'Non renseigné'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Poste</span>
                    <span className="info-value">{user.poste || 'Non renseigné'}</span>
                  </div>
               
                  <div className="info-row">
                    <span className="info-label">Membre depuis</span>
                    <span className="info-value">
                      {user.dateInscription ? new Date(user.dateInscription).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {user.bio && (
                <div className="info-card full-width">
                  <div className="info-header">
                    <FaUser />
                    <h3>Bio</h3>
                  </div>
                  <div className="info-content">
                    <p className="bio-text">{user.bio}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="security-section">
              <div className="info-card">
                <div className="info-header">
                  <FaShieldAlt />
                  <h3>Sécurité</h3>
                </div>
                <div className="info-content">
                  <button 
                    onClick={() => setShowPasswordModal(true)} 
                    className="change-password-btn"
                  >
                    <FaKey /> Changer le mot de passe
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal changement de mot de passe */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <div className="modal-header">
              <h3><FaKey /> Changer le mot de passe</h3>
              <button onClick={() => setShowPasswordModal(false)} className="close-modal">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="password-form">
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="success-message">
                  <FaCheckCircle /> {passwordSuccess}
                </div>
              )}
              
              <div className="form-group">
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                  required
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="cancel-btn">
                  Annuler
                </button>
                <button type="submit" className="save-btn">
                  Changer le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

