import { useState, useEffect } from 'react';
import { useNavigate, Link,useLocation } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUserShield,
  FaSignInAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';
import authService from '../services/authService';
import '../css/AdminConnexion.css';
 
const addmin=import.meta.env.VITE_localADMIN
const U_admin=import.meta.env.VITE_user_a
const emaily=import.meta.env.VITE_admin_email
export default function AdminLogin() {
  
   const navigate = useNavigate();
  const location = useLocation();
  
 
  const isAlreadyOnConnexion = location.pathname === '/admin/connexion';
  

  useEffect(() => {
    const token = localStorage.getItem(addmin);
    const user = JSON.parse(localStorage.getItem(U_admin) || '{}');
    

    if (token && (user.role === 'admin' || user.role === 'Admin')) {
      if (!isAlreadyOnConnexion) {
        navigate('/admin/statistique', { replace: true });
      }
    }
  }, [navigate, isAlreadyOnConnexion]);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // ✅ Vérifier si déjà connecté
  useEffect(() => {
    const token = localStorage.getItem(addmin);
    const user = JSON.parse(localStorage.getItem(U_admin) || '{}');
    
    if (token && (user.role === 'admin' || user.role === 'Admin')) {
      navigate('/admin/statistique', { replace: true });
    }
  }, [navigate]);
  
  // ✅ Charger email mémorisé
  useEffect(() => {
    const savedEmail = localStorage.getItem(emaily);
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
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
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await authService.adminLogin(
        formData.email, 
        formData.password,
        formData.role
      );
      
      console.log('✅ Admin login success:', response);
      
      if (response.user.role !== 'admin' && response.user.role !== 'Admin') {
        setError('Accès réservé aux administrateurs');
        setLoading(false);
        return;
      }
      
      if (rememberMe) {
        localStorage.setItem(emaily, formData.email);
      } else {
        localStorage.removeItem(emaily);
      }
      
      localStorage.setItem(addmin, response.access_token);
      localStorage.setItem(U_admin, JSON.stringify(response.user));
      
      setSuccess('Connexion réussie ! Redirection...');
      
      setTimeout(() => {
        navigate('/admin/statistique', { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.response?.status === 401) {
        setError('Email ou mot de passe incorrect');
      } else if (error.response?.status === 403) {
        setError('Accès réservé aux administrateurs');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };
    const handleNavigateToConnexion = (e) => {
    if (isAlreadyOnConnexion) {
      e.preventDefault();
      console.warn('Vous êtes déjà sur la page de connexion');
      return;
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
      
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-icon-wrapper">
            <FaUserShield className="admin-icon" />
          </div>
          <h1>Administration BCN</h1>
          <p>Accès réservé aux administrateurs</p>
        </div>
        
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
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope /> Email administrateur
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="admin@bcn.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FaLock /> Mot de passe
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
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
            
            <Link to="/admin/forword" className="forgot-password">
              Mot de passe oublié ?
            </Link>
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
              <>
                <FaSignInAlt /> Se connecter
              </>
            )}
          </button>
        </form>
        
        {/* ✅ Bouton vers Connexion.jsx */}
        <div className="alternative-login">
          <div className="separator">
            <p className='sou'>ou</p>
          </div>
          
          <Link to="/admin/connexion" className="connexion-link-btn" onClick={handleNavigateToConnexion}>
            <FaUserShield />
            <span>Accéder à l'espace Inscription</span>
            <FaArrowRight />
          </Link>
          
          <p className="alternative-hint">
            Utilisez l'espace inscription pour une authentification avancée
          </p>
        </div>
        
        <div className="admin-login-footer">
          <p>
            <FaUserShield /> Panel d'administration BCN
          </p>
          <p className="security-notice">
            Toute tentative d'accès non autorisé est enregistrée
          </p>
        </div>
      </div>
    </div>
  );
}