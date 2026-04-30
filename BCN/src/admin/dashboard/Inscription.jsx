import "../css/Inscription.css";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useState } from "react";

export default function Inscription() {
  // Chargement correct des images
  const images = Object.values(
    import.meta.glob("../imges/membres/*.png", { eager: true })
  ).map(m => m.default);

  const [usersData, setUsersData] = useState([
    {
      id: 1,
      name: "Maryem Qadiri",
      job: "Directrice Marketing @ TechCorp",
      date: "12 Nov 2024",
      status: "pending"
    },
    {
      id: 2,
      name: "Amine Tahri",
      job: "Fondateur @ StartUp Inc",
      date: "12 Nov 2024",
      status: "pending"
    },
    {
      id: 3,
      name: "Nasim.BN",
      job: "Consultant Indépendant",
      date: "12 Nov 2024",
      status: "pending"
    },
    {
      id: 4,
      name: "Zineb Kabiri",
      job: "Consultante Indépendante",
      date: "11 Nov 2024",
      status: "pending"
    },
    {
      id: 5,
      name: "Oussama Orfi",
      job: "Consultant Indépendant",
      date: "11 Nov 2024",
      status: "pending"
    },
    {
      id: 6,
      name: "Hiba Abyad",
      job: "Consultante RH",
      date: "10 Nov 2024",
      status: "pending"
    },
    {
      id: 7,
      name: "Soad Banoun",
      job: "Consultante Indépendante",
      date: "09 Nov 2024",
      status: "pending"
    },
    {
      id: 8,
      name: "Yassine El Fassi",
      job: "Développeur Web",
      date: "08 Nov 2024",
      status: "pending"
    }
  ]);

  // Filtrer pour n'afficher que les utilisateurs en attente
  const pendingUsers = usersData.filter(user => user.status === "pending");

  // Fonction pour approuver un utilisateur
  const handleApprove = (userId) => {
    setUsersData(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: "approved" }
          : user
      )
    );
    console.log(`Utilisateur ${userId} approuvé`);
  };

  // Fonction pour rejeter un utilisateur
  const handleReject = (userId) => {
    setUsersData(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: "rejected" }
          : user
      )
    );
    console.log(`Utilisateur ${userId} rejeté`);
  };

  return (
    <>
      <div className="inscription-container">
        <div className="container">
          <div className="header-section">
            <h1>Inscriptions en attente</h1>
            <div className="stats-badge">
              {pendingUsers.length} demande(s) en attente
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>Aucune inscription en attente</h3>
              <p>Toutes les demandes ont été traitées</p>
            </div>
          ) : (
            <div className="list">
              {pendingUsers.map((user, index) => (
                <div className="row" key={user.id}>
                  {/* LEFT SECTION */}
                  <div className="info">
                    <img 
                      src={images[index % images.length]} 
                      alt={user.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/50x50?text=User";
                      }}
                    />
                    <div className="user-details">
                      <h3 style={{color:"#000",fontWeight:"700",fontFamily:"inter,sans-serif"}}>{user.name}</h3>
                      <p className="job">{user.job}</p>
                      <p className="date">📅 Reçu le {user.date}</p>
                    </div>
                  </div>

                  {/* RIGHT SECTION - ACTIONS */}
                  <div className="actions">
                    <span className="status-badge status-pending">
                      En attente
                    </span>

                    <div className="action-buttons">
                      <button 
                        className="btn-reject"
                        onClick={() => handleReject(user.id)}
                        title="Rejeter"
                      >
                        <FaTimes />
                      </button>

                      <button 
                        className="btn-approve"
                        onClick={() => handleApprove(user.id)}
                      >
                        <FaCheck /> Approuver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}