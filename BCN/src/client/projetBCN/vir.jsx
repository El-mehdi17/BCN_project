import Footer from "./Footer";
import "./css/vir.css"
import im from "./img/email icon.png"
import d from "./img/Logo/logod.png";

import { NavLink } from "react-router-dom";
import cdmdp from "./Cmdp"
import { useDispatch,useSelector } from "react-redux";
import { setOK } from "../redux/redux";

// Vir.jsx
import { useState } from 'react';
import { Link, useNavigate,useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import './css/vir.css';
import { Award } from "lucide-react";
import api from "../services/api";

export default function Vir() {
    let dispatch=useDispatch()
    let sele=useSelector(sel=>sel.copie)
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setServerErrors({});
    
    // Validation locale
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
    
    setLoading(true);
    
    try {
     // const response = await authService.forgotPassword(email);
      let  takeToken= await authService.Take_token(email)
      localStorage.setItem("takeToken",takeToken.token)
      localStorage.setItem("takeEmail",email)
      
      setSuccess(true);
      setEmail('');
      //console.log(response)
   
      // Après 3 secondes, rediriger vers la page de connexion
    
      
    } catch (error) {
      if (error.errors) {
        setServerErrors(error.errors);
        setError('Veuillez corriger les erreurs ci-dessous');
      } else {
        setError(error.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="vir-container">
      <div className="vir-card">
        <h1>Mot de passe oublié</h1>
        <p className="vir-description">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            <p>✓ Un email de réinitialisation a été envoyé !</p>
            <p>Vérifiez votre boîte de réception et cliquez sur le lien.</p>
            <p className="redirect-message">Redirection vers la page de connexion...</p>
          </div>
        )}
        <nav>

           <div className="courd">
            <div className="imgi"><img src={im} alt="email_icon" /></div>
            <h3>Nous vous avons envoyé un e-mail contenant les instructions pour réinitialiser votre mot de passe.</h3>
            <p>Cela peut prendre jusqu’à 10 minutes. Si vous ne recevez pas les instructions sous peu, veuillez vérifier le dossier « Courrier indésirable » ou « Courrier indésirable » de votre messagerie. Si cela ne fonctionne pas, essayez de renvoyer votre demande.

<b><NavLink onClick={()=>dispatch(setOK(false))} to="/Cmdp" style={{fontWeight: "bold"}}> Renvoyer votre demande.</NavLink></b></p>
           </div>
           </nav>
        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                type="email"
                id="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              {serverErrors.email && (
                <span className="field-error">{serverErrors.email[0]}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>

            <div className="vir-links">
              <Link to="/inscription" className="back-link">
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}