// NotFound.jsx
import { useNavigate } from 'react-router-dom';
import './/css/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        {/* Animation 404 */}
        <div className="error-code">
          <span className="digit">4</span>
          <span className="digit">0</span>
          <span className="digit">4</span>
        </div>

        {/* Message d'erreur */}
        <h1 className="error-title">Page Non Trouvée</h1>
        <p className="error-description">
          Oops! La page que vous recherchez semble avoir disparu dans le néant numérique.
        </p>
        
        {/* Suggestions */}
        <div className="suggestions">
          <p className="suggestion-text">Vous pourriez essayer :</p>
          <ul>
            <li>✓ Vérifier l'URL</li>
            <li>✓ Retourner à l'accueil</li>
            <li>✓ Contacter le support</li>
          </ul>
        </div>

        {/* Boutons d'action */}
        <div className="action-buttons">
          <button onClick={handleGoHome} className="btn btn-primary">
            🏠 Page d'Accueil
          </button>
          <button onClick={handleGoBack} className="btn btn-secondary">
            ⬅️ Page Précédente
          </button>
        </div>

        {/* Illustration SVG */}
        <div className="illustration">
          <svg 
            width="200" 
            height="200" 
            viewBox="0 0 200 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" fill="#F0F1F2" />
            <path 
              d="M70 70 L130 130 M130 70 L70 130" 
              stroke="#A81B1B" 
              strokeWidth="8" 
              strokeLinecap="round"
            />
            <circle cx="75" cy="75" r="8" fill="#FF4242" />
            <circle cx="125" cy="125" r="8" fill="#FF4242" />
            <path 
              d="M80 140 Q100 155 120 140" 
              stroke="#A81B1B" 
              strokeWidth="6" 
              strokeLinecap="round" 
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFound;