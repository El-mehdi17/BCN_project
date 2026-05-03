import { Route, Routes, Navigate} from 'react-router-dom'
import Accueil from './Accueil.jsx'
import Inscription from './inscription.jsx'
import NotFound from './NotFound.jsx'
import Vir from './vir.jsx'
import Cmd from './Cmdp.jsx'
import ClientDashboard from './ClientDashboard.jsx'
import Actualite from "./Actualite.jsx"
import Connexion from "./connexion.jsx"
import ClientProfil from './ClientProfil.jsx'
import Messages from './Messages.jsx'
import Evenements from './Evenement.jsx'
import Corps from "../../admin/dashboard/corps.jsx"

const access = import.meta.env.VITE_access_token
const user_local = import.meta.env.VITE_USER
const user_cas = import.meta.env.VITE_API_DASHBOARD

function ClientProtectedRoute({ children }) {

  const token = localStorage.getItem(access);
  const user = JSON.parse(localStorage.getItem(user_local) || "{}");

  if (!token) return <Navigate to="/inscription" replace />;
  if (user.role !== "client" && user.role !== "Client") return <Navigate to="/" replace />;

  return children;
}

export default function Cour() {
  
  
  return (
    
      <Routes>
        <Route path="/" element={<Navigate to="/accueil" />} />
        <Route path='/accueil' element={<Accueil />} />
        <Route path='/connexion' element={<Connexion />} />
        <Route path='/inscription' element={<Inscription />} />
        <Route path='/Actualite' element={<Actualite />} />
        <Route path='/vir' element={<Vir />} />
        <Route path='/Cmdp' element={<Cmd />} />
        <Route path='/reset-password' element={<Cmd />} />

        <Route path="/admin" element={<Navigate to="/admin/admin/login" replace />} />
         <Route path="/admin/*" element={<Corps />} />


        <Route path={`${user_cas}/:nomComplet/dashboard`} element={<ClientProtectedRoute><ClientDashboard /></ClientProtectedRoute>} />
        <Route path={`${user_cas}/:nomComplet/profil`} element={<ClientProtectedRoute><ClientProfil /></ClientProtectedRoute>} />
        <Route path={`${user_cas}/:nomComplet/evenements`} element={<ClientProtectedRoute><Evenements /></ClientProtectedRoute>} />
        <Route path={`${user_cas}/:nomComplet/messages`} element={<ClientProtectedRoute><Messages /></ClientProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    
  )
}
