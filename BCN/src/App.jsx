import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Headers from './projetBCN/header'
import Cour from './projetBCN/cour'
import AdminHeader from './admin/dashboard/header'

const authGOOgle=import.meta.env.VITE_AUTH
function App() {
  return (
    <GoogleOAuthProvider clientId={authGOOgle} >
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
