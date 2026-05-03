import "./css/Actualite.css";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { setWasf } from "../redux/redux";
import { useEffect, useState } from "react";

export default function Actualite() {
  let dispatch = useDispatch()
  const { Img, Titre, des } = useSelector((t) => t.wasfy);
  const [showTooltip, setShowTooltip] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  
  let images = Object.values(
    import.meta.glob('./img/photos/*.png', { eager: true })
  ).map((module) => module.default);
  
  let data = images.map((img, i) => ({
    Img: img,
   
    index: i
  }))
  
  
  
  useEffect(() => {
    if (data.length > 0 && !Img) {
      dispatch(setWasf({ ...data[0], i: 0 }));
    }
    
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, [data, dispatch, Img]);

  const openImageModal = (imageData) => {
    setSelectedImage(imageData);
    dispatch(setWasf({ ...imageData, i: imageData.index }));
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Fonction pour formater le texte en français
  const formatText = (text) => {
    if (!text) return null;
    
    // Vérifier si c'est le texte de la soirée de gala
    if (text.includes('La Soirée de Gala Annuelle de BCN')) {
      const sections = text.split(/\n\s*\n/);
      
      return (
        <div className="event-text">
          {sections.map((section, idx) => {
            // Section Détails
            if (section.includes('Détails de l\'événement')) {
              const lines = section.split('\n').filter(line => line.trim() && !line.includes('Détails'));
              return (
                <div key={idx} className="event-section">
                  <h3> Détails de l'événement</h3>
                  <ul>
                    {lines.map((line, i) => {
                      const [key, ...value] = line.split(':');
                      return (
                        <li key={i}>
                          <strong>{key.trim()}:</strong> {value.join(':').trim()}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            }
            // Section Programme
            else if (section.includes('Programme')) {
              const lines = section.split('\n').filter(line => line.trim() && !line.includes('Programme'));
              return (
                <div key={idx} className="event-section">
                  <h3> Programme</h3>
                  <ul>
                    {lines.map((line, i) => (
                      <li key={i}>{line.trim()}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            // Section Objectif
            else if (section.includes('Objectif')) {
              const content = section.replace('Objectif :', '').trim();
              return (
                <div key={idx} className="event-section">
                  <h3> Objectif</h3>
                  <p>{content}</p>
                </div>
              );
            }
            // Premier paragraphe
            else {
              return <p key={idx} className="event-intro">{section.trim()}</p>;
            }
          })}
        </div>
      );
    }
    
    // Pour les autres textes, garder le format original avec préserve des espaces
    return <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>;
  };

  return (
    <>
      <div className="home">
        {showTooltip && (
          <div className="welcome-tooltip">
            <div className="tooltip-content">
              <span className="tooltip-icon">💡</span>
              <p>Cliquez sur n'importe quelle image pour l'agrandir et voir la description détaillée</p>
              <button onClick={() => setShowTooltip(false)} className="tooltip-close">✕</button>
            </div>
          </div>
        )}

        <div className="class">
          <div className="imges">
            <div>
              <img src={Img} alt={Titre} />
            </div>
            <div className="text">
              <h2>{Titre}</h2>
              {formatText(des)}
            </div>
          </div>

          <div className="gallery">
            <h3 className="gallery-title">📸 Galerie d'images - Cliquez pour agrandir</h3>
            {data.map((code, i) => (
              <div key={i} className="images">
                <img 
                  onClick={() => openImageModal(code)}
                  src={code.Img} 
                  alt={code.titre}
                  title="Cliquez pour agrandir l'image avec description"
                />
                <span className="click-hint">👆 Cliquez pour agrandir</span>
              </div>
            ))}
          </div>
        </div>
      </div>

     
      <Footer />
    </>
  );
}