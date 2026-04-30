import Statistique from "./Statistique.jsx";
import Membres from "./Membres.jsx";
import Inscription from "./Inscription.jsx";

import "../css/header.css";
import Evenements from "./Evenements.jsx";
import Message from "./Message.jsx";
import Login from "./login.jsx";
import Connexion from "./Connexion.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import ProfileAdmin from "./ProfileAdmin.jsx";
import { useEffect,useState } from "react";
import { Route,Routes ,Navigate} from "react-router-dom";
import ForWord from "./forword.jsx";

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
function PublicRoute({ children }) {
  const token = localStorage.getItem('admin_access_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
  if (token && (user.role === 'admin' || user.role === 'Admin')) {
    return <Navigate to="/admin/statistique" replace />;
  }
  
  return children;
}

export default function Corps(){

    return(
        <div className="corps">
        <Routes>
          {/* ✅ Routes publiques */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/connexion" element={
            <PublicRoute>
              <Connexion />
            </PublicRoute>
          } />
          
          {/* ✅ Routes protégées */}
          <Route path="/statistique" element={
            <ProtectedRoute>
              <Statistique />
            </ProtectedRoute>
          } />
          
          <Route path="/membres" element={
            <ProtectedRoute>
              <Membres />
            </ProtectedRoute>
          } />
          
          <Route path="/evenements" element={
            <ProtectedRoute>
              <Evenements />
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <Message />
            </ProtectedRoute>
          } />
          
          <Route path="/ProfileAdmin" element={
            <ProtectedRoute>
              <ProfileAdmin />
            </ProtectedRoute>
          } />

          <Route path="/forword" element={<PublicRoute><ForWord /></PublicRoute>} />

          {/* ✅ Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/admin" element={<Navigate to="/login" replace />} />
          
          {/* ✅ Route 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    )
}