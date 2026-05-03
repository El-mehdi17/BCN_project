
import { useState, useEffect } from 'react';
import { createNameSlug } from '../utils/urlHelper';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { setOK } from '../redux/redux';
import axios from 'axios';
import authService from '../services/authService';
import './css/connexion.css';

const APIDASHBOARD=import.meta.env.VITE_API_DASHBOARD
export default function Connexion() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const reduxState = useSelector(s => s.copie);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role:"client"
  });
  
  const [type, setType] = useState('password');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  
  // Message de succès après inscription
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
//Mise à jour des données : [e.target.name] est utilisé pour mettre à jour le champ correct en fonction de la propriété name dans l’entrée.
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (serverErrors[e.target.name]) {
      setServerErrors({
        ...serverErrors,
        [e.target.name]: null
      });
    }
  };

  const togglePassword = () => {
    setType(type === 'password' ? 'text' : 'password');
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Veuillez entrer votre adresse email');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }
    
    if (!formData.password) {
      setError('Veuillez entrer votre mot de passe');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Reset states
  setError('');
  setServerErrors({});
  
  if (!validateForm()) return;
  
  setLoading(true);
  
  try {
    const response = await authService.login(
      formData.email, 
      formData.password, 
      formData.role
    );
      // ✅ Créer le slug à partir du nom complet
     const user = response.user; 
    
    // Remember me functionality
    if (rememberMe) {
      localStorage.setItem('remembered_email', formData.email);
    } else {
      localStorage.removeItem('remembered_email');
    }
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Show success message
    setSuccess('Connexion réussie ! Redirection...');
    
    // Redirect based on role
    setTimeout(() => {
      switch (response.user.role) {
        case 'admin':
          navigate('/admin/statiques', { replace: true });
          break;
        case 'Client':
        case "client":  
          navigate(
           `${APIDASHBOARD}/${user.nomComplet}/dashboard`,
            { replace: true }
          );
          break;
        default:
          navigate('/accueil', { replace: true });
      }
    }, 1500);
    
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.errors) {
      setServerErrors(error.errors);
      setError('Veuillez corriger les erreurs ci-dessous');
    } else if (error.message) {
      setError(error.message);
    } else {
      setError('Email ou mot de passe incorrect');
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="connexion-container">
      <div className="connexion-wrapper">
        

        <div className="connexion-card">
          <h1 className="connexion-title">Connexion</h1>
          <p className="connexion-subtitle">
            Connectez-vous pour accéder à votre compte
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
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="connexion-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${serverErrors.email ? 'error' : ''}`}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {serverErrors.email && (
                <span className="field-error">{serverErrors.email[0]}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={type}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${serverErrors.password ? 'error' : ''}`}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="password-toggle"
                  tabIndex="-1"
                >
                  {type === 'password' ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {serverErrors.password && (
                <span className="field-error">{serverErrors.password[0]}</span>
              )}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Se souvenir de moi</span>
              </label>

              <NavLink 
                to="/vir" 
                className="forgot-password-link"
                onClick={() => dispatch(setOK(false))}
              >
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
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="separator">
            <b>ou</b>
          </div>

         

          <div className="signup-link">
            <p>
              Pas encore de compte ?{' '}
              <NavLink to="/inscription" className="signup-link-text">
                Créer un compte
              </NavLink>
            </p>
          </div>

          <div className="additional-links">
            <NavLink to="/" className="back-home">
              ← Retour à l'accueil
            </NavLink>
          </div>
        </div>

        <div className="help-section">
          <p>
            Besoin d'aide ?{' '}
            <NavLink to="/Accueil" className="help-link">
              Contactez-nous
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}