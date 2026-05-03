
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createNameSlug } from '../utils/urlHelper';

import { FaEye, FaEyeSlash } from 'react-icons/fa';
import authService from '../services/authService';
import './css/inscription.css';  

export default function Inscription() {
  
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    poste: '',
    active:false,
    ville: '',
    entrepriseNom: '',
    role:"Client"
  });
  
  const [type1, setType1] = useState("password");
  const [type2, setType2] = useState("password");
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Supprimer l'erreur du champ lors de la saisie
    if (serverErrors[e.target.name]) {
      setServerErrors({
        ...serverErrors,
        [e.target.name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setServerErrors({});
    
    // Vérification de la correspondance du mot de passe
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    // Vérification de la force du mot de passe
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    
  // Vérifier la présence de lettres majuscules et minuscules et de chiffres
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.');
      return;
    }
    
    setLoading(true);
    
    try {
      const filterNOM = (x) => {
   return x.trim().replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
                
      }
   const userData = {
   
        nomComplet: filterNOM(formData.nomComplet),
        email: formData.email,
        password: newPassword,
        password_confirmation: confirmPassword,
        poste: formData.poste || null,
        ville: formData.ville || null,
        active: false,
        entrepriseNom: formData.entrepriseNom || null,
        dateInscription: new Date().toISOString().split('T')[0], // Date du jour
        role: formData.role, // Rôle par défaut
        profileCompleted: false // Profil incomplet
      };
      
      const response = await authService.register(userData);
      
      setSuccess(true);
      // Réinitialise le formulaire
      setNewPassword('');
      setConfirmPassword('');
      setFormData({
        nomComplet: '',
        email: '',
        poste: '',
        active:false,
        ville: '',
        entrepriseNom: '',
        role:""

      });
      
      //Redirection vers la page de contact après 2 secondes
      setTimeout(() => {
        navigate('/connexion', { 
          state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' }
        });
      }, 2000);
      
    } catch (error) {
      if (error.errors) {
        // Erreurs de vérification Laravel
        setServerErrors(error.errors);
        setError('Veuillez corriger les erreurs ci-dessous');
      } else {
        setError(error.message || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggle1 = () => setType1(type1 === "password" ? "text" : "password");
  const toggle2 = () => setType2(type2 === "password" ? "text" : "password");

  return (
    <div className="inscription-container">
      <div className="inscription-wrapper">
        <div className="inscription-card">
          <h1 className="inscription-title">Inscription</h1>
          <p className="inscription-subtitle">
            Créez votre compte pour commencer
          </p>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              Inscription réussie ! Redirection vers la connexion...
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="inscription-form" method='post'>
            <div className="form-group">
              <label htmlFor="nomComplet">Nom Complet *</label>
              <input
                type="text"
                name="nomComplet"
                id="nomComplet"
                placeholder="Votre nom complet"
                value={formData.nomComplet}
                onChange={handleChange}
                className={serverErrors.nomComplet ? 'error' : ''}
                required
              />
              {serverErrors.nomComplet && (
                <span className="field-error">{serverErrors.nomComplet[0]}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="amine.dupont@entreprise.com"
                value={formData.email}
                onChange={handleChange}
                className={serverErrors.email ? 'error' : ''}
                required
              />
              {serverErrors.email && (
                <span className="field-error">{serverErrors.email[0]}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="poste">Poste</label>
                <input
                  type="text"
                  name="poste"
                  id="poste"
                  placeholder="Votre poste"
                  value={formData.poste}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group half">
                <label htmlFor="ville">Ville</label>
                <input
                  type="text"
                  name="ville"
                  id="ville"
                  placeholder="Votre ville"
                  value={formData.ville}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="entrepriseNom">Entreprise</label>
              <input
                type="text"
                name="entrepriseNom"
                id="entrepriseNom"
                placeholder="Nom de l'entreprise"
                value={formData.entrepriseNom}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Mot de passe *</label>
              <div className="password-wrapper">
                <input
                  type={type1}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={serverErrors.password ? 'error' : ''}
                  required
                />
                <button 
                  type="button" 
                  onClick={toggle1} 
                  className="password-toggle"
                  tabIndex="-1"
                >
                  {type1 === "password" ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {serverErrors.password && (
                <span className="field-error">{serverErrors.password[0]}</span>
              )}
            </div>

            <div className="form-group">
              <label>Confirmez mot de passe *</label>
              <div className="password-wrapper">
                <input
                  type={type2}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={toggle2} 
                  className="password-toggle"
                  tabIndex="-1"
                >
                  {type2 === "password" ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            {/* Indicateurs de force du mot de passe*/}
            {newPassword && (
              <div className="password-strength">
                <p>Le mot de passe doit contenir :</p>
                <ul>
                  <li className={newPassword.length >= 8 ? 'valid' : ''}>
                    Au moins 8 caractères
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>
                    Une majuscule
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? 'valid' : ''}>
                    Une minuscule
                  </li>
                  <li className={/\d/.test(newPassword) ? 'valid' : ''}>
                    Un chiffre
                  </li>
                </ul>
              </div>
            )}

            <div className="form-options">
              <NavLink className="forgot-password-link" to="/vir">
                Mot de passe oublié ?
              </NavLink>
            </div>

            <button 
              type="submit" 
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Inscription en cours...
                </>
              ) : (
                'S\'inscrire'
              )}
            </button>

            <div className="separator">
              <b>ou</b>
            </div>

            <button 
              type="button" 
              className="secondary-button" 
              onClick={() => navigate('/connexion')}
            >
              Se connecter
            </button>
          </form>

          <div className="additional-links">
            <NavLink to="/" className="back-home">
              ← Retour à l'accueil
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}