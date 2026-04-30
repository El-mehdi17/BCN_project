import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Headers from './client/projetBCN/header'
import Cour from './client/projetBCN/cour'
import AdminHeader from './admin/dashboard/header'
 
const aut=import.meta.env.VITE_Auth_x
function App() {
  return (
    <GoogleOAuthProvider clientId={aut}>
      <BrowserRouter>
        <Routes>
          {/* Espace Admin */}
          <Route path="/admin/*" element={<AdminHeader />} />

          {/* Espace Client */}
          <Route path="/*" element={
            <>
              <Headers />
              <Cour />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
