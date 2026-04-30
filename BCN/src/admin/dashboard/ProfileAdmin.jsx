// BCN_admin/src/dashboard/ProfileAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Save, Lock, User, Mail, Phone, Shield, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import '../css/ProfileAdmin.css';

const addmin=import.meta.env.VITE_localADMIN
const U_admin=import.meta.env.VITE_user_a
const emaily=import.meta.env.VITE_admin_email
const adapi=import.meta.env.VITE_ADMIN_ADMIN_API
const adavatar=import.meta.env.VITE_ADMIN_AVATAR
const adavaupdate=import.meta.env.VITE_UPDATE_AVATAR
const ubpass=import.meta.env.VITE_UPDATE_password_Lient

const ProfileAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telephone: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: null
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [adminId, setAdminId] = useState(null);

  // Récupérer les données du profil admin
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setPageLoading(true);
      const token = localStorage.getItem(addmin);
      const user = JSON.parse(localStorage.getItem(U_admin) || '{}');
      
      // Stocker l'ID admin
      const currentAdminId = user.id || user.ID || user.Id;
      setAdminId(currentAdminId);
      
     

      try {
        // Utiliser la route correcte pour récupérer le profil admin
        const response = await axios.get(`${adapi}/${currentAdminId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

       
        
        const adminData = response.data.admin || response.data;
        setFormData(prev => ({
          ...prev,
          name: adminData.nomComplet || adminData.name || user.nomComplet || '',
          email: adminData.email || user.email || '',
          telephone: adminData.phone || user.phone || '',
          role: adminData.role || user.role || 'Admin',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          avatar: null
        }));

        if (adminData.avatar) {
          setPreviewAvatar(`${adavatar}/${adminData.avatar}`);
        } else if (adminData.photoUrl) {
          setPreviewAvatar(adminData.photoUrl);
        } else if (user.photoUrl) {
          setPreviewAvatar(user.photoUrl);
        }
      } catch (apiError) {
        console.warn('⚠️ API non disponible, utilisation des données locales:', apiError.message);
        // Utiliser les données du localStorage en fallback
        setFormData(prev => ({
          ...prev,
          name: user.nomComplet || 'Admin',
          email: user.email || 'admin@bcn.com',
          telephone: user.phone || '',
          role: user.role || 'Admin',
        }));
        
        if (user.photoUrl) {
          setPreviewAvatar(user.photoUrl);
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement du profil'
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleAvatarUpload = async (file) => {
    const token = localStorage.getItem(addmin);
    const user = JSON.parse(localStorage.getItem(U_admin) || '{}');
    const adminId = user.id || user.ID;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        // Option 1: Route dédiée à l'avatar
        const response = await axios.post(
            `${adapi}/${adminId}/${adavaupdate}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            }
        );

        console.log('✅ Avatar uploadé:', response.data);
        return response.data.avatar_url;

    } catch (error) {
        console.error('❌ Erreur upload avatar:', error.response?.data);
        throw error;
    }
};

// Version intégrée dans handleAvatarChange
const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    
    // Reset erreurs
    setErrors(prev => ({ ...prev, avatar: '' }));
    
    if (!file) return;

    // Validation
    if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'Image trop volumineuse (max 2MB)' }));
        e.target.value = '';
        return;
    }

    if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'Format non supporté' }));
        e.target.value = '';
        return;
    }

    // Aperçu immédiat
    setPreviewAvatar(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, avatar: file }));

    // Upload automatique (optionnel)
    try {
        setLoading(true);
        const avatarUrl = await handleAvatarUpload(file);
        
        // Mettre à jour l'aperçu avec l'URL du serveur
        setPreviewAvatar(avatarUrl);
        
        setMessage({
            type: 'success',
            text: 'Photo de profil mise à jour !'
        });
        
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
        setErrors(prev => ({ 
            ...prev, 
            avatar: error.response?.data?.message || 'Erreur lors de l\'upload' 
        }));
    } finally {
        setLoading(false);
    }
};
  const validateProfileForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (formData.telephone && !/^[0-9+\-\s]{8,15}$/.test(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // BCN_admin/src/dashboard/ProfileAdmin.jsx

// Remplacez la fonction handleUpdateProfile par celle-ci :

const handleUpdateProfile = async (e) => {
  e.preventDefault();
  
  if (!validateProfileForm()) return;

  setLoading(true);
  setMessage({ type: '', text: '' });

  try {
    const token = localStorage.getItem(addmin);
    const user = JSON.parse(localStorage.getItem(U_admin) || '{}');
    const currentAdminId = user.id || user.ID || adminId;
    
    console.log('📤 Mise à jour profil admin ID:', currentAdminId);

    // ⚠️ CORRECTION : Utiliser PUT au lieu de POST
    // Et envoyer les données au format JSON (pas FormData) pour éviter les problèmes
    
    const updateData = {
      nomComplet: formData.name,
      email: formData.email,
      telephone: formData.telephone || '',
      avatar: formData.avatar?.name || null // L'avatar sera traité séparément
    };

    console.log('📦 Données envoyées:', updateData);

    // Si pas d'avatar, envoyer en JSON
    if (!formData.avatar) {
      const response = await axios.put(
        `${adapi}/${currentAdminId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      
    } else {
      // Si avatar, utiliser FormData avec POST vers une route dédiée
      const formDataToSend = new FormData();
      formDataToSend.append('nomComplet', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telephone', formData.telephone || '');
      formDataToSend.append('avatar', formData.avatar);

      // Utiliser une route POST pour l'upload d'avatar
      const response = await axios.post(
        `${adapi}/${currentAdminId}`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        }
      );
    }

    // Mettre à jour le localStorage
    localStorage.setItem(U_admin, JSON.stringify({
      ...user,
      nomComplet: formData.name,
      email: formData.email,
      telephone: formData.telephone
    }));

    setMessage({
      type: 'success',
      text: 'Profil mis à jour avec succès !'
    });

    // Rafraîchir les données
    await fetchAdminProfile();

    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  } catch (error) {
    console.error('❌ Erreur mise à jour:', error.response?.data);
    
    // Afficher les erreurs de validation
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors || {};
      setErrors(validationErrors);
    } else {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      });
    }
  } finally {
    setLoading(false);
  }
};

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem(addmin);
      const user = JSON.parse(localStorage.getItem(U_admin) || '{}');
      const currentAdminId = user.id || user.ID || adminId;
      
      console.log('🔐 Changement mot de passe pour admin ID:', currentAdminId);

      // ⚠️ CORRECTION IMPORTANTE : Envoyer les bons noms de champs
      const passwordData = {
        password: formData.newPassword,              // Changé de 'new_password' à 'password'
        password_confirmation: formData.confirmPassword  // Changé de 'new_password_confirmation'
      };

      console.log('📤 Données mot de passe envoyées:', passwordData);

      // Essayer d'abord avec PUT
      try {
        const response = await axios.put(
          `${adapi}/${currentAdminId}/${ubpass}`,
          passwordData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Mot de passe changé:', response.data);
        setMessage({
          type: 'success',
          text: response.data.message || 'Mot de passe changé avec succès !'
        });
      } catch (putError) {
        // Si PUT échoue avec 405, essayer POST
        if (putError.response?.status === 405) {
          console.log('🔄 PUT non supporté, essai avec POST...');
          const postResponse = await axios.post(
            `${adapi}/${currentAdminId}/${ubpass}`,
            passwordData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('✅ Mot de passe changé via POST:', postResponse.data);
          setMessage({
            type: 'success',
            text: postResponse.data.message || 'Mot de passe changé avec succès !'
          });
        } else {
          throw putError;
        }
      }

      // Réinitialiser les champs de mot de passe
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Erreur changement mot de passe:', error.response?.data);
      
      // Afficher les erreurs de validation
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        const mappedErrors = {};
        
        // Mapper les erreurs Laravel vers les champs React
        if (validationErrors.password) {
          mappedErrors.newPassword = validationErrors.password[0];
        }
        if (validationErrors.password_confirmation) {
          mappedErrors.confirmPassword = validationErrors.password_confirmation[0];
        }
        if (validationErrors.current_password) {
          mappedErrors.currentPassword = validationErrors.current_password[0];
        }
        
        setErrors(mappedErrors);
      }
      
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Erreur lors du changement de mot de passe'
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="profile-loading">
        <Loader className="spinner-icon" size={40} />
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-admin-container">
      <div className="profile-admin-header">
        <h1 className="profile-admin-title">
          <User size={28} />
          Profile Administrateur
        </h1>
        <p className="profile-admin-subtitle">
          Gérez vos informations personnelles et votre sécurité
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="profile-content">
        {/* Section Informations du profil */}
        <div className="profile-section">
          <h2 className="section-title">
            <User size={20} />
            Informations personnelles
          </h2>
          
          <div className="avatar-section">
            <div className="avatar-preview">
              {previewAvatar ? (
                <img src={previewAvatar} alt="Avatar" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {formData.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
            </div>
            <label className="avatar-upload-btn">
              <Camera size={16} />
              <span>Changer la photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
              />
            </label>
            {errors.avatar && <span className="error-message">{errors.avatar}</span>}
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Entrez votre nom complet"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Entrez votre email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={`form-input ${errors.telephone ? 'input-error' : ''}`}
                  placeholder="Entrez votre numéro"
                />
                {errors.telephone && <span className="error-message">{errors.telephone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Shield size={16} />
                  Rôle
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  className="form-input input-disabled"
                  disabled
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="spinner-icon" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </form>
        </div>

        {/* Section Changement de mot de passe */}
        <div className="profile-section">
          <h2 className="section-title">
            <Lock size={20} />
            Sécurité
          </h2>
          
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Mot de passe actuel
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
                placeholder="Entrez votre mot de passe actuel"
              />
              {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
                placeholder="Minimum 8 caractères"
              />
              {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirmez le nouveau mot de passe"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="btn-change-password"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="spinner-icon" />
                  Modification...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Changer le mot de passe
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;