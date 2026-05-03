import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUserShield,
  FaUserPlus,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBuilding,
  FaMapMarkerAlt,
  FaImage,
  FaTimes,
  FaUpload
} from 'react-icons/fa';
import authService from '../services/authService';
import '../css/AdminInscription.css';

export default function Inscription() {
  const navigate = useNavigate();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    password: '',
    confirmPassword: '',
    ville: '',
    entrepriseNom: 'BCN',
    poste: 'Administrateur',
    role: 'admin'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serverErrors, setServerErrors] = useState({});
  
  // Image de profil
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // ✅ Vérifier si déjà connecté et si admin


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Effacer l'erreur du champ
    if (serverErrors[name]) {
      setServerErrors({
        ...serverErrors,
        [name]: null
      });
    }
    setError('');
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Gestion de l'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 Mo');
      return;
    }
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nomComplet || formData.nomComplet.length < 3) {
      errors.nomComplet = 'Le nom complet doit contenir au moins 3 caractères';
    }
    
    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Veuillez entrer un email valide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setServerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs ci-dessous');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('📤 Données à envoyer:', {
        nomComplet: formData.nomComplet,
        email: formData.email,
        poste: formData.poste,
        ville: formData.ville,
        entrepriseNom: formData.entrepriseNom,
        role: formData.role
      });
      
      // Préparer les données
      const userData = {
        nomComplet: formData.nomComplet,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        poste: formData.poste || 'Administrateur',
        ville: formData.ville || null,
        entrepriseNom: formData.entrepriseNom || 'BCN',
        role: formData.role,
        photoUrl: imagePreview  || null,
      };
     
      // ✅ Appel API
      const response = await authService.registerAdmin(userData);
      
      console.log('✅ Réponse serveur:', response);
      
      setSuccess('✅ Administrateur créé avec succès !');
      
      // Réinitialiser le formulaire
      setFormData({
        nomComplet: '',
        email: '',
        password: '',
        confirmPassword: '',
        ville: '',
        entrepriseNom: 'BCN',
        poste: 'Administrateur',
        role: 'admin'
      });
      removeImage();
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      console.error('❌ Response:', error.response);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      
      // Gestion des erreurs
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        setServerErrors(errors);
        
        // Construire un message d'erreur lisible
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages || 'Erreur de validation');
      } else if (error.response?.status === 401) {
        setError('Session expirée. Redirection...');
        setTimeout(() => navigate('/admin/connexion'), 2000);
      } else if (error.response?.status === 403) {
        setError('Vous n\'avez pas les droits pour créer un administrateur');
      } else if (error.response?.status === 500) {
        setError('Erreur serveur: ' + (error.response.data.message || 'Erreur interne'));
      } else if (error.message === 'Network Error') {
        setError('Erreur réseau. Vérifiez que le serveur Laravel est lancé.');
      } else {
        setError(error.response?.data?.message || error.message || 'Erreur lors de la création');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-inscription-container">
      <div className="inscription-wrapper">
        {/* En-tête */}
        <div className="inscription-header">
          <div className="header-icon">
            <FaUserPlus />
          </div>
          <h1>Créer un compte administrateur</h1>
          <p>Ajoutez un nouvel administrateur à la plateforme BCN</p>
        </div>
        
        {/* Messages */}
        {error && (
          <div className="error-message">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <FaCheckCircle />
            <span>{success}</span>
          </div>
        )}
        
        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="inscription-form">
          <div className="form-grid">
            {/* Colonne gauche */}
            <div className="form-column">
              {/* Nom complet */}
              <div className="form-group">
                <label htmlFor="nomComplet">
                  <FaUser /> Nom complet <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="nomComplet"
                    name="nomComplet"
                    placeholder="Ex: Jean Dupont"
                    value={formData.nomComplet}
                    onChange={handleChange}
                    className={serverErrors.nomComplet ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {serverErrors.nomComplet && (
                  <span className="field-error">{serverErrors.nomComplet}</span>
                )}
              </div>
              
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope /> Email <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="admin@bcn.ma"
                    value={formData.email}
                    onChange={handleChange}
                    className={serverErrors.email ? 'error' : ''}
                    disabled={loading}
                  />
                </div>
                {serverErrors.email && (
                  <span className="field-error">{serverErrors.email}</span>
                )}
              </div>
              
              {/* Mot de passe */}
              <div className="form-group">
                <label htmlFor="password">
                  <FaLock /> Mot de passe <span className="required">*</span>
                </label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={serverErrors.password ? 'error' : ''}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="password-toggle"
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {serverErrors.password && (
                  <span className="field-error">{serverErrors.password}</span>
                )}
              </div>
              
              {/* Confirmation mot de passe */}
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock /> Confirmer <span className="required">*</span>
                </label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={serverErrors.confirmPassword ? 'error' : ''}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPassword}
                    className="password-toggle"
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {serverErrors.confirmPassword && (
                  <span className="field-error">{serverErrors.confirmPassword}</span>
                )}
              </div>
            </div>
            
            {/* Colonne droite */}
            <div className="form-column">
              {/* Entreprise */}
              <div className="form-group">
                <label htmlFor="entrepriseNom">
                  <FaBuilding /> Entreprise
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="entrepriseNom"
                    name="entrepriseNom"
                    placeholder="BCN"
                    value={formData.entrepriseNom}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Poste */}
              <div className="form-group">
                <label htmlFor="poste">
                  <FaUserShield /> Poste
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="poste"
                    name="poste"
                    placeholder="Administrateur"
                    value={formData.poste}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Ville */}
              <div className="form-group">
                <label htmlFor="ville">
                  <FaMapMarkerAlt /> Ville
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="ville"
                    name="ville"
                    placeholder="Casablanca"
                    value={formData.ville}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Upload image */}
              <div className="form-group">
                <label>
                  <FaImage /> Photo de profil
                </label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={removeImage}
                        disabled={loading}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading}
                        hidden
                      />
                      <div className="upload-placeholder">
                        <FaUpload />
                        <span>Cliquez pour ajouter une photo</span>
                        <small>PNG, JPG (max 5 Mo)</small>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Création en cours...
                </>
              ) : (
                <>
                  <FaUserPlus /> Créer l'administrateur
                </>
              )}
            </button>
            
            <Link to="/admin/membres" className="cancel-btn">
              Annuler
            </Link>
          </div>
        </form>
        
        {/* Info */}
        <div className="inscription-info">
          <FaUserShield />
          <p>
            Les administrateurs ont accès à toutes les fonctionnalités de gestion.
          </p>
        </div>
      </div>
    </div>
  );
}