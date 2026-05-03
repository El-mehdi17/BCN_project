// BCN_admin/src/dashboard/header.jsx
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import logo from "../imges/logo/BCNlogo.png";
import { ChartNoAxesColumn, Users, UserPlus, Calendar, MessageSquare, Bell, X, Menu, LogOut } from 'lucide-react';
import Statistique from "./Statistique.jsx";
import Membres from "./Membres.jsx";
import Inscription from "./Inscription.jsx";
import { useState, useEffect, useRef } from "react";
import profil from "../imges/img/Profile.png";
import "../css/header.css";
import Evenements from "./Evenements.jsx";
import Message from "./Message.jsx";
import Login from "./login.jsx";
import Connexion from "./Connexion.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import ProfileAdmin from "./ProfileAdmin.jsx";
import Corps from "./corps.jsx";
import axios from "axios";

// ✅ Composant pour protéger les routes admin
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
    
    if (token && (user.role === 'admin' || user.role === 'Admin')) {
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Vérification de l'accès...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

// ✅ Composant pour rediriger si déjà connecté
function PublicRoute({ children }) {
  const token = localStorage.getItem('admin_access_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
  if (token && (user.role === 'admin' || user.role === 'Admin')) {
    return <Navigate to="/admin/statistique" replace />;
  }
  
  return children;
}

export default function Header() {
  let hasUnreadMessages = true;
  let [width, setWidth] = useState(window.innerWidth);
  let [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // ✅ État pour l'avatar dans le Header
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  
  // ✅ Récupérer l'utilisateur connecté
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const isAuthenticated = !!localStorage.getItem('admin_access_token');

  // ✅ Récupérer l'avatar de l'admin connecté
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminAvatar();
    }
  }, [isAuthenticated]);

  const fetchAdminAvatar = async () => {
    try {
      setAvatarLoading(true);
      const token = localStorage.getItem('admin_access_token');
      const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
      const currentAdminId = user.id || user.ID || user.Id;
      
      console.log('📋 Récupération avatar pour admin ID:', currentAdminId);

      try {
        // Essayer de récupérer depuis l'API
        const response = await axios.get(
          `http://localhost:8000/api/admin/admins/${currentAdminId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

       
        
        const adminData = response.data.admin || response.data;

        // Priorité 1: avatar (chemin storage)
        if (adminData.avatar) {
          const avatarUrl = `http://localhost:8000/storage/${adminData.avatar}`;
          setPreviewAvatar(avatarUrl);
          // Mettre à jour le localStorage
          localStorage.setItem('admin_user', JSON.stringify({
            ...user,
            photoUrl: avatarUrl,
            avatar: adminData.avatar
          }));
        }
        // Priorité 2: photoUrl (URL complète)
        else if (adminData.photoUrl) {
          setPreviewAvatar(adminData.photoUrl);
        }
        // Priorité 3: photoUrl du localStorage
        else if (user.photoUrl) {
          setPreviewAvatar(user.photoUrl);
        }
        // Priorité 4: avatar par défaut
        else {
          setPreviewAvatar(profil);
        }
      } catch (apiError) {
        console.warn('⚠️ API non disponible, utilisation du localStorage');
        
        // Fallback sur localStorage
        if (user.photoUrl) {
          setPreviewAvatar(user.photoUrl);
        } else {
          setPreviewAvatar(profil);
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement avatar:', error);
      setPreviewAvatar(profil);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      if (window.innerWidth > 850) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // ✅ Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_login_time');
    window.location.href = '/admin/login';
  };

  // ✅ Gérer l'erreur de chargement d'image
  const handleImageError = (e) => {
    e.target.src = profil; // Image par défaut
  };

  // ✅ Navigation items - seulement si authentifié
  const navItems = isAuthenticated ? [
    { path: "/admin/statistique", icon: ChartNoAxesColumn, label: "Dashboard" },
    { path: "/admin/membres", icon: Users, label: "Membres" },
    { path: "/admin/evenements", icon: Calendar, label: "Événements" },
   
  ] : [];

  return (
    <>
      <header>
        <div className="logo">
          <img src={logo} alt="Logo BCN" />
        </div>

        {width > 850 ? (
          // Version desktop
          <>
            {isAuthenticated && (
              <div className="list">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.path}
                    to={item.path} 
                    className={({ isActive }) => isActive ? "active-link" : "boo"}
                  >
                    <item.icon /> {item.label}
                  </NavLink>
                ))}
              </div>
            )}

            <div className="head">
              {isAuthenticated && (
                <>
                  <div className="notification-wrapper">
                    <NavLink to="/admin/messages">
                      <Bell color="#000" strokeWidth={2} className="bell-icon" />
                    </NavLink>
                    {hasUnreadMessages && (
                      <span className="notification-badge">1</span>
                    )}
                  </div>
                  <div className="personne">
                    <NavLink to="/admin/ProfileAdmin">
                      <img 
                        src={previewAvatar || profil} 
                        alt="Profil" 
                        onError={handleImageError}
                      />
                    </NavLink>
                    <div className="user-dropdown">
                      <span>{user.nomComplet || 'Admin'}</span>
                      <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={16} /> Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          // Version mobile
          <>
            {isAuthenticated && (
              <div className="head-mobile">
                <div className="notification-wrapper">
                  <NavLink to="/admin/messages">
                    <Bell color="#000" strokeWidth={2} className="bell-icon" />
                  </NavLink>
                  {hasUnreadMessages && (
                    <span className="notification-badge">4</span>
                  )}
                </div>
                <div className="personne">
                  <NavLink to="/admin/ProfileAdmin">
                    <img 
                      src={previewAvatar || profil} 
                      alt="Profil" 
                      onError={handleImageError}
                    />
                  </NavLink>
                </div>
              </div>
            )}
           
            {isAuthenticated && (
              <button 
                className="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}

            {/* Menu mobile overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
              <div className="mobile-menu-container" ref={menuRef}>
                <div className="mobile-menu-header">
                  <img src={logo} alt="Logo" className="mobile-logo" />
                  <button 
                    className="mobile-menu-close"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <nav className="mobile-nav">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => 
                        `mobile-nav-item ${isActive ? 'active' : ''}`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                  
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </header>

     <Corps />
    </>
  );
}