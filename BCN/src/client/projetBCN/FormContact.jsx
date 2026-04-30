import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';

const FormContact = () => {
  // États pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    message: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Référence vers le composant reCAPTCHA
  const recaptchaRef = useRef(null);

  // VOS CLÉS (à mettre dans un fichier .env)
  const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
  
  // Gestion des champs du formulaire
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Récupérer le token reCAPTCHA
    const token = recaptchaRef.current.getValue();
    
    if (!token) {
      setMessage({ 
        type: 'error', 
        text: '❌ Veuillez confirmer que vous n\'êtes pas un robot' 
      });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // 2. Envoyer le formulaire + token au backend
      const response = await axios.post('http://localhost:5000/api/contact', {
        ...formData,
        recaptchaToken: token
      });
      
      // Succès
      setMessage({ 
        type: 'success', 
        text: '✅ Message envoyé avec succès !' 
      });
      
      // Réinitialiser le formulaire
      setFormData({ nom: '', email: '', message: '' });
      recaptchaRef.current.reset(); // Réinitialiser reCAPTCHA
      
    } catch (error) {
      // Erreur
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || '❌ Une erreur est survenue' 
      });
      recaptchaRef.current.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Formulaire de contact</h2>
      
      {message.text && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24'
        }}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Nom complet *</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label>Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            style={styles.textarea}
          />
        </div>
        
        {/* Widget reCAPTCHA */}
        <div style={styles.recaptcha}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={SITE_KEY}
            onChange={() => {
              // Optionnel: nettoyer l'erreur quand l'utilisateur valide
              if (message.type === 'error') setMessage({ type: '', text: '' });
            }}
            onExpired={() => {
              // Quand le token expire
              setMessage({ type: 'error', text: '⏰ La vérification a expiré, veuillez recommencer' });
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            ...styles.button,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Envoi en cours...' : 'Envoyer le message'}
        </button>
      </form>
    </div>
  );
};

// Styles simples (vous pouvez utiliser CSS/SCSS/Tailwind à la place)
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    resize: 'vertical'
  },
  recaptcha: {
    display: 'flex',
    justifyContent: 'center',
    margin: '10px 0'
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  },
  message: {
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center'
  }
};

export default FormContact;