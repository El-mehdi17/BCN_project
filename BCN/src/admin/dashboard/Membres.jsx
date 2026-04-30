import "../css/Membres.css";
import { useEffect, useState } from "react";
import userService from "../services/userService";
import api from "../services/api";

const add_cleint=import.meta.env.VITE_ADD_CLients
export default function Membres() {
  let [user, setUser] = useState(null);
  let images = Object.values(
    import.meta.glob("../imges/membres/*.png", { eager: true })
  ).map((mod) => mod.default);

useEffect(() => {
  const preloadImages = async () => {
  let reponse= await api.get(add_cleint);
  
  setUser(reponse.data.clients);
  return reponse.data;
  };

  preloadImages();
}, []);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await userService.getClients();
        setClients(clientsData);
      } catch (error) {
        console.error("❌ Erreur fetchClients:", error);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="container">
      <h2>Membres</h2>

      <div className="cards">
        {clients.map((client, i) => (
          <div className="cardd" key={client.id}>
            <img src={user[i]?.photoUrl!==null ? user[i].photoUrl : images[i] || images[0] } alt="" />

            <h3>{client.nomComplet}</h3>
            <p className="job">{client.poste}</p>

            <p className="date">
              📅 Reçu le{" "}
              {client.dateInscription
                ? client.dateInscription.slice(0, 10).replace(/-/g, "/")
                : "Non définie"}
            </p>

            <button onClick={() => setSelectedClient(client)}>
              Voir
            </button>
          </div>
        ))}
      </div>

      {/* Modal infos client */}
      {selectedClient && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="modal-client"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Informations Client</h2>

            <ul className="client-listw">
              <li><strong>Nom :</strong> {selectedClient.nomComplet}</li>
              <li><strong>Email :</strong> {selectedClient.email}</li>
              <li><strong>Poste :</strong> {selectedClient.poste}</li>
              <li><strong>Ville :</strong> {selectedClient.ville}</li>
              <li><strong>Entreprise :</strong> {selectedClient.entrepriseNom}</li>
              <li><strong>Rôle :</strong> {selectedClient.role}</li>
              <li><strong>Téléphone :</strong> {selectedClient.telephone || "Non défini"}</li>
              <li>
                <strong>Date inscription :</strong>{" "}
                {selectedClient.dateInscription
                  ? selectedClient.dateInscription.slice(0, 10)
                  : "Non définie"}
              </li>
              <li>
                <strong>Compte actif :</strong>{" "}
                {selectedClient.active ? "Oui" : "Non"}
              </li>
            </ul>

            <button
              className="close-btn"
              onClick={() => setSelectedClient(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}