import api from "../services/api";
import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import {Search} from 'lucide-react';


import "./css/evenement.css";

const Storage=import.meta.env.VITE_STORAGE_URL
const VEVURL=import.meta.env.VITE_EVENTS_URL

export default function Evenement() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  let [searchTerm, setSearchTerm] = useState("");

 
  const [openDescription, setOpenDescription] = useState(null);

  const fetchEvenements = async () => {
    try {
      const response = await api.get(VEVURL);
      setEvenements(response.data.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvenements();
  }, []);

  const toggleDescription = (id) => {
    setOpenDescription(openDescription === id ? null : id);
  };

  if (loading) return <h2>Chargement...</h2>;
const filteredEvents = evenements.filter(ev =>
 ev.titre.toLowerCase().includes(searchTerm.toLowerCase())
);
  return (
    <div className="even-page">
      <div className="search_evenement">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un événement..."
          className="search-input"
        /> <span className="search-btn"><Search /></span>
      
      </div>
    { filteredEvents.length > 0 ? (
        <h1>Événements disponibles</h1>
      ) : (
        <h1>Aucun événement disponible</h1>
      )}

      <div className="even-grid">
        {filteredEvents.map((evenement) => (
          <div key={evenement.id} className="even-card">

            {/* image */}
            <img
              src={
                evenement.imageUrl
                  ? evenement.imageUrl.startsWith("http")
                    ? evenement.imageUrl
                    : `${Storage}/${evenement.imageUrl}`
                  : "/default-event.jpg"
              }
              alt={evenement.titre}
              className="even-image"
            />

            {/* content */}
            <div className="even-content">

              <h3>{evenement.titre}</h3>

              <div className="even-info">
                <span>
                  <FaCalendarAlt />
                  {evenement.date
                    ? new Date(evenement.date).toLocaleDateString("fr-FR")
                    : "Date inconnue"}
                </span>

                <span>
                  <FaMapMarkerAlt />
                  {evenement.lieu || "Lieu à confirmer"}
                </span>

                <span>
                  <FaUsers />
                  {evenement.capaciteMax || 0} places
                </span>
              </div>

              <div className="even-price">
                {evenement.prix > 0
                  ? `${evenement.prix} DH`
                  : evenement.prix === 0
                  ? "Gratuit"
                  : "Prix à confirmer"}
              </div>

              
              <button
                className="detail-btn"
                onClick={() => toggleDescription(evenement.id)}
              >
                {openDescription === evenement.id ? (
                  <>
                    Masquer Description <FaChevronUp />
                  </>
                ) : (
                  <>
                    Voir Description <FaChevronDown />
                  </>
                )}
              </button>

              {/* Description */}
              {openDescription === evenement.id && (
                <div className="even-description">
                  {evenement.description || "Pas de description disponible"}
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}