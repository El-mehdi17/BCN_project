import "../css/stat.css"
import { useState, useEffect } from "react";
import {
     Users, UserPlus, Calendar, Coins , Clock, CalendarDays,
      Mail, Check, TrendingUp, MoreVertical, Edit3, Trash2, X, Save, Loader2,BanknoteArrowUp  } from 'lucide-react';
import { NavLink } from "react-router-dom";
import eventService from "../services/eventService";
import userService from "../services/userService";
import api from "../services/api";

import Zineb from "../imges/img/Zineb.png"
 
const somme_de_prix=import.meta.env.VITE_somme_PRIX
const stat=import.meta.env.VITE_stat
export default function Statistique() {
    const [counti, setCount] = useState(0);
    const [evenements, setEvenements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalMembres: 0,
        inscriptionsEnAttente: 0,
        evenementsMois: 0,
        messagesNonLus: 0
    });
//  countUsers utilisé pour stocker le nombre total de membres récupéré depuis l'API pour l'afficher dans le dashboard. Il est initialisé à 0 et mis à jour après l'appel à l'API dans la fonction countUser.    
    let [countUsers, setCountUsers] = useState(0);
// percentage utilisé pour stocker le pourcentage de croissance des membres par rapport au mois précédent. Il est initialisé à 0 et mis à jour après l'appel à l'API dans la fonction loadStats, en utilisant les données reçues de l'API pour calculer le pourcentage de croissance. Ce pourcentage est ensuite affiché dans le dashboard à côté du nombre total de membres.    
    let [percentage, setPercentage] = useState(0);


    const [eventParticipantsCount, setEventParticipantsCount] = useState({});
    const [menuOpen, setMenuOpen] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [toast, setToast] = useState(null);
    const [myParticipations, setMyParticipations] = useState([]);
    const [xid, setXid] = useState(0);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editForm, setEditForm] = useState({
        titre: "",
        description: "",
        lieu: "",
        date: "",
        prix: "",
        capaciteMax: ""
    });
    const [saving, setSaving] = useState(false);
    const [totalPrix, setTotalPrix] = useState(null);
   let [idcool,setIdcool]=useState(0)
   let [nbrcool,setNbrcool]=useState(0)

  useEffect( () =>  {
    
     fetchTotalPrix();
  }, []);
    async function fetchTotalPrix() {
   try{
    // Appel à ton API Laravel
    let response= await api.get(somme_de_prix)
     
        setTotalPrix(response.data.total_prix);
        console.log(response.data)
        setLoading(false);
    }
      catch(error) {
        console.error("Erreur lors de la récupération :", error);
        setLoading(false);
      };
    }

    const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80";
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
 const loadUserCount = async () => {
    try {
     const response = await userService.clientsPerMonth();
     setPercentage(response );
    } catch (error) {
        console.error('❌ Erreur clientsPerMonth ❤️:', error, {
            stats: { total: 0 }
        });
    }
  }
    // ✅ Fonction d'aide pour obtenir le lien vers l'image correcte
    const getImageUrl = (url) => {
        if (!url) return DEFAULT_EVENT_IMAGE;
        
        // Si c'est déjà une URL complète (commence par http)
        if (typeof url === 'string' && url.startsWith('http')) {
            return url;
        }
        
        
        if (typeof url === 'string' && url.startsWith('data:')) {
            return url;
        }

        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        let path = url;

        // Nettoyer le chemin
        if (path.startsWith('/')) {
            path = path.substring(1);
        }

        // Si le chemin contient déjà 'storage/', on le traite
        if (path.startsWith('storage/')) {
            return `${baseUrl}/${path}`;
        }
        
        // Par défaut, on rajoute /storage/
        return `${baseUrl}/storage/${path}`;
    };

    useEffect(() => {
        loadAllData();

        const handleClickOutside = (e) => {
            if (!e.target.closest('.event-menu-container')) {
                setMenuOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadEvenements(),
                loadCount(),
                loadStats(),
                countUser(),
                loadUserCount(),
            ]);
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    };
    let countUser = async () => {
   try {
    const response = await userService.getcountUsers();
    setCountUsers(response || 0);
   
    } catch (error) {
        console.error('❌ Erreur getcountUsers:', error, {
            stats: { total: 0 }
        });
    }
    };
    const loadEvenements = async () => {
        try {
            const response = await eventService.getEvents({ per_page: 100 });
            const eventsList = response.data?.data || response.data || [];

        
            
            eventsList.forEach(event => {
              
            });

            setEvenements(eventsList);

            const participationsRes = await eventService.getMyParticipations();
            setMyParticipations(participationsRes.data || participationsRes || []);

            const countsObject = {};

            for (const event of eventsList) {
                try {
                    const countRes = await api.get(`/evenements/nbrCLient/${event.id}`);
                     countsObject[event.id] = countRes.data.nb_en_attente || 0;
                } catch (error) {
                    
                    countsObject[event.id] = 0;
                }
            }

            setEventParticipantsCount(countsObject);

        } catch (error) {
            console.error('Erreur chargement événements:', error);
        }
    };

    const isRegistered = (eventId) => {
        return myParticipations.some(p => p.evenement_id === eventId);
    };

    const loadCount = async () => {
        try {
            const response = await eventService.getCountEvenements();
            setCount(response || 0);
        } catch (err) {
            console.error("❌ Erreur getCountEvenements:", err);
        }
    };

    const loadStats = async () => {
    try {
        const response = await api.get(stat);

        const data = response.data;
        if (data.success && data.stats) {
            setStats({
                totalMembres: data.stats.total_clients || 0,
                inscriptionsEnAttente: data.stats.inscriptions_en_attente || 0,
                evenementsMois: data.stats.total_evenements || 0,
                messagesNonLus: data.stats.messages_non_lus || 0
            });
        }

    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
};

    const formatDate = (dateString) => {
        if (!dateString) return 'Date à confirmer';
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const formatPrix = (prix) => {
        if (!prix || prix === 0) return 'Gratuit';
        return `${prix} DH`;
    };

   const getParticipantsCount = (eventId) => {
    const current = eventParticipantsCount[eventId] || 0;

    const event = evenements.find(e => e.id === eventId);
    const maxCapacity = event?.capaciteMax || 50;

    return `${current}/${maxCapacity}`;
};
    const toggleMenu = (eventId) => {
        setMenuOpen(menuOpen === eventId ? null : eventId);
    };

    const handleEdit = (evenement) => {
        setMenuOpen(null);
        setEditingEvent(evenement.id);
        setEditForm({
            titre: evenement.titre || "",
            description: evenement.description || "",
            lieu: evenement.lieu || "",
            date: evenement.date ? evenement.date.split('T')[0] : "",
            prix: evenement.prix?.toString() || "",
            capaciteMax: evenement.capaciteMax?.toString() || "50"
        });
    };

    const handleCancelEdit = () => {
        setEditingEvent(null);
        setEditForm({
            titre: "",
            description: "",
            lieu: "",
            date: "",
            prix: "",
            capaciteMax: ""
        });
    };

    const handleSaveEdit = async (eventId) => {
        if (!editForm.titre.trim()) {
            showToast('❌ Le titre est requis', 'error');
            return;
        }

        setSaving(true);
        try {
            const eventData = {
                titre: editForm.titre.trim(),
                description: editForm.description.trim(),
                lieu: editForm.lieu.trim(),
                date: editForm.date,
                prix: editForm.prix ? parseFloat(editForm.prix) : 0,
                typePrix: editForm.prix && parseFloat(editForm.prix) > 0 ? "payant" : "gratuit",
                capaciteMax: parseInt(editForm.capaciteMax) || 50
            };

            await eventService.updateEvent(eventId, eventData);

            showToast('✅ Événement mis à jour avec succès', 'success');
            setEditingEvent(null);
            loadEvenements();
            loadCount();
        } catch (error) {
            console.error('Erreur mise à jour:', error);
            showToast('❌ Erreur lors de la mise à jour', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (evenement) => {
        setMenuOpen(null);
        setShowDeleteConfirm(evenement);
    };

    const confirmDelete = async () => {
        if (!showDeleteConfirm) return;

        try {
            await eventService.deleteEvent(showDeleteConfirm.id);
            showToast('✅ Événement supprimé avec succès', 'success');
            setShowDeleteConfirm(null);
            loadAllData();
        } catch (error) {
            console.error('Erreur suppression:', error);
            showToast('❌ Erreur lors de la suppression', 'error');
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    let img = Object.values(
        import.meta.glob("../imges/img/message/*.png", { eager: true })
    ).map((mod) => mod.default);

    let mode = [
        { nom: "Hiba abyad", message: "Bonjour, je souhaiterais savoir s'il reste des places...", temps: "Il y a 2 heures" },
        { nom: "Soad banoun", message: "Est-il possible de mettre à jour mon profil entreprise ?", temps: "Il y a 2 jours" },
        { nom: "Oussama Orfi", message: "Merci pour l'événement d'hier !", temps: "Hier" }
    ];

    useEffect(() => {

        const fetchParticipantCount = async () => {
            if (xid > 0) {
                try {
                    const test = await eventService.getCountPART(xid);
                    console.log(`Participants for event ${xid}:`, test.total_participants);
                    setEventParticipantsCount(prev => ({
                        ...prev,
                        [xid]: test.total_participants
                    }));
                } catch (error) {
                    console.error('Error fetching participant count:', error);
                }
            }
        };

        fetchParticipantCount();
    }, [xid]);
 

    return (
        <article className="acrticle_stat">
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.msg}
                </div>
            )}

            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🗑️ Confirmer la suppression</h3>
                            <button className="modal-close" onClick={() => setShowDeleteConfirm(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Voulez-vous vraiment supprimer :</p>
                            <p className="event-name">"{showDeleteConfirm.titre}" ?</p>
                            <p className="warning-text">⚠️ Cette action est irréversible.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowDeleteConfirm(null)}>
                                Annuler
                            </button>
                            <button className="btn-delete" onClick={confirmDelete}>
                                <Trash2 size={16} /> Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="nav_1">
                <h2>Aperçu Général</h2>
                <div className="cashi">
                    <div className="carti">
                        <h4>Total Membres</h4>
                        <Users  size={45} className="iconi" />
                        <h3>{countUsers || 0} </h3>
                        <p><TrendingUp /> {percentage || 17 }% ce mois</p>
                    </div>
                  
                    <div className="carti">
                        <h4>Événements à Venir</h4>
                        <Calendar size={45} className="iconi" />
                        <h3>{counti}</h3>
                        <p><CalendarDays /> Ce mois: {stats.evenementsMois || 0}</p>
                    </div>
                    <div className="carti">
                        <h4>Total des bénéfices </h4>
                        <Coins size={45}  className="iconi" />
                        <h3><b>Prix : </b>{totalPrix !== null ? totalPrix : 'Chargement...'} Dh</h3>
                        <p><BanknoteArrowUp /> Nouveaux reçus</p>
                    </div>
                </div>
            </nav>

            
            <nav className="nav_3">
                <div className="moon">
                    <h3>Planning & Événements</h3>
                    <NavLink to="/admin/evenements">
                        <p>Gérer le calendrier</p>
                    </NavLink>
                </div>
             <div className="ho">
                <div className="attente">
                    {loading ? (
                        <div className="loading">Chargement...</div>
                    ) : evenements.length > 0 ? (
                        evenements.map((evenement) => (
                            <div className="back" key={evenement.id}>
                                {editingEvent === evenement.id ? (
                                    <div className="edit-form-inline">
                                        <button
                                            className="close-edit"
                                            onClick={handleCancelEdit}
                                        >
                                            <X size={20} />
                                        </button>

                                        <input
                                            type="text"
                                            className="edit-input"
                                            placeholder="Titre"
                                            value={editForm.titre}
                                            onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })}
                                        />

                                        <textarea
                                            className="edit-textarea"
                                            placeholder="Description"
                                            rows="2"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        />

                                        <input
                                            type="text"
                                            className="edit-input"
                                            placeholder="Lieu"
                                            value={editForm.lieu}
                                            onChange={(e) => setEditForm({ ...editForm, lieu: e.target.value })}
                                        />

                                        <input
                                            type="date"
                                            className="edit-input"
                                            value={editForm.date}
                                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                        />

                                        <div className="edit-row">
                                            <input
                                                type="number"
                                                className="edit-input"
                                                placeholder="Prix (DH)"
                                                value={editForm.prix}
                                                onChange={(e) => setEditForm({ ...editForm, prix: e.target.value })}
                                                min="0"
                                            />

                                            <input
                                                type="number"
                                                className="edit-input"
                                                placeholder="Capacité"
                                                value={editForm.capaciteMax}
                                                onChange={(e) => setEditForm({ ...editForm, capaciteMax: e.target.value })}
                                                min="1"
                                            />
                                        </div>

                                        <div className="edit-actions">
                                            <button
                                                className="btn-save"
                                                onClick={() => handleSaveEdit(evenement.id)}
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <><Loader2 size={16} className="spinner-small" /> Enregistrement...</>
                                                ) : (
                                                    <><Save size={16} /> Enregistrer</>
                                                )}
                                            </button>
                                            <button
                                                className="btn-cancel-edit"
                                                onClick={handleCancelEdit}
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="event-menu-container">
                                            <span
                                                className="menu-trigger"
                                                onClick={() => {
                                                    setXid(evenement.id);
                                                    toggleMenu(evenement.id);
                                                }}
                                            >
                                                <MoreVertical style={{color:"black"}} size={20} />
                                            </span>

                                            {menuOpen === evenement.id && (
                                                <div className="event-dropdown-menu">
                                                    <span
                                                        className="menu-item edit"
                                                        onClick={() => handleEdit(evenement)}

                                                    >
                                                        <Edit3 color="black" size={16} /> Modifier
                                                    </span>
                                                    <span
                                                        className="menu-item delete"
                                                        onClick={() => handleDeleteClick(evenement)}
                                                    >
                                                        <Trash2 color="black" size={16} /> Supprimer
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {isRegistered(evenement.id) && (
                                            <div className="registered-badge">
                                                <Check size={14} /> Inscrit
                                            </div>
                                        )}


                                        <img
                                            style={{ width: "100%", height: "150px", objectFit: "cover" }}
                                          
                                            src={
  evenement.imageUrl?.startsWith("http")
    ? evenement.imageUrl
    : `http://localhost:8000/storage/${evenement.imageUrl}`
}
                                            alt={evenement.titre || 'Événement'}
                                            onError={(e) => {
                                                console.error(`❌ Erreur chargement image pour event ${evenement.id}:`, e.target.src);
                                                e.target.src = DEFAULT_EVENT_IMAGE;
                                                e.onerror = null;
                                            }}
                                            onLoad={() => {
                                                console.log(`✅ Image chargée pour event ${evenement.id}`);
                                            }}
                                        />

                                        <div className="moon">
                                            <p style={{ textDecoration: "none", fontSize: "15px" }}>
                                                {evenement.titre}
                                            </p>
                                            <p className="p2" style={{ textDecoration: "none" }}>
                                                <Users /> {getParticipantsCount(evenement.id)}
                                            </p>
                                        </div>
                                        <p className="p3">{evenement.lieu || 'Lieu à confirmer'}</p>
                                        <p className="p4">{formatDate(evenement.date)}</p>
                                        <div className="hadui">
                                            <b className="p5" style={{ width: "fit-content" }}>
                                                {formatPrix(evenement.prix)}
                                            </b>
                                            <p className="p6" style={{ width: "fit-content" }}>
                                                {evenement.typePrix === 'payant' ? '/participant' : '/membres'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-events">Aucun événement à venir</div>
                    )}
                </div>
                </div>
            </nav>

            
        </article>
    );
}
