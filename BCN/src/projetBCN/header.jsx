import { NavLink, useLocation,useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActive, setOK } from "../redux/redux";
import authService from '../services/authService';

import {
  FaChartBar,
  FaCalendarAlt,
  FaComments,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt
} from "react-icons/fa";

import Logo from "./img/Logo/logod.png";
import "./css/header.css";
import HeaderAdmin from "../admin/dashboard/header"

const access_token=import.meta.env.VITE_access_token;
const user_local=import.meta.env.VITE_USER
const email_remember=import.meta.env.VITE_remembered_email

const APIDASHBOARD=import.meta.env.VITE_API_DASHBOARD


export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
 

const nomComplet = user?.nomComplet;

  const dispatch = useDispatch();

  const sele = useSelector((state) => state.copie);
  const colorA = useSelector((state) => state.navigation);

  const [open, setOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const isMobile = screenWidth <= 768;
  const pathname = location.pathname;

  const isPublicPage =
    pathname.includes("/accueil") ||
    pathname.includes("/Actualite") ||
    pathname.includes("/inscription")||
    pathname.includes("/vir")||
    pathname.includes("/cmdp");

  const isClientPage = pathname.includes("/client");
  const isAdminPage = pathname.startsWith("/admin");
 const handleLogout = () => {
    authService.logout();
    navigate('/', { replace: true });
    localStorage.removeItem(access_token)
    localStorage.removeItem(email_remember)
    localStorage.removeItem(user_local)
  };
  /* ---------------- resize ---------------- */
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------------- route state ---------------- */
  useEffect(() => {
    if (pathname === "/accueil") {
      dispatch(setActive("a"));
      dispatch(setOK(true));
    } else if (pathname === "/Actualite") {
      dispatch(setActive("e"));
      dispatch(setOK(true));
    } else if (pathname === "/inscription") {
      dispatch(setActive("f"));
      dispatch(setOK(true));
    } else if (pathname.includes("/client")) {
      dispatch(setOK(true));
    } else if(pathname.startsWith("/admin")){
      dispatch(setOK(false))
    }
    else {
      dispatch(setOK(false));
    }

    setOpen(false);
  }, [pathname, dispatch]);

  /* ---------------- public desktop ---------------- */
  const PublicDesktopMenu = () => (
    <>
      <div className="routes">
        <NavLink
          to="/accueil"
          className={colorA.a ? "ouvert" : ""}
          onClick={() => dispatch(setActive("a"))}
        >
          Accueil
        </NavLink>

        <NavLink
          to="/accueil#propos"
          className={colorA.b ? "ouvert" : ""}
          onClick={() => dispatch(setActive("b"))}
        >
          À propos
        </NavLink>

        <NavLink
          to="/accueil#Galerie"
          className={colorA.c ? "ouvert" : ""}
          onClick={() => dispatch(setActive("c"))}
        >
          Galerie
        </NavLink>

        <NavLink
          to="/accueil#contact"
          className={colorA.d ? "ouvert" : ""}
          onClick={() => dispatch(setActive("d"))}
        >
          Contact
        </NavLink>

        <NavLink
          to="/Actualite"
          className={colorA.e ? "ouvert" : ""}
          onClick={() => dispatch(setActive("e"))}
        >
          Actualité
        </NavLink>
      </div>

      <div className="inscrit">
        <NavLink to="/inscription">
          <button>Inscription</button>
        </NavLink>
      </div>
    </>
  );

  /* ---------------- public mobile ---------------- */
  const PublicMobileMenu = () => (
    <>
      <button className="menu" onClick={() => setOpen(!open)}>
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {open && (
        <div className="mobile-menu">
          <NavLink to="/accueil">Accueil</NavLink>
          <NavLink to="/accueil#propos">À propos</NavLink>
          <NavLink to="/accueil#Galerie">Galerie</NavLink>
          <NavLink to="/accueil#contact">Contact</NavLink>
          <NavLink to="/Actualite">Actualité</NavLink>
          <NavLink to="/inscription">
            <button>Inscription</button>
          </NavLink>
        </div>
      )}
    </>
  );

  /* ---------------- client desktop ---------------- */
  const ClientDesktopMenu = () => (
    <div className="rout">
      <NavLink to={`${APIDASHBOARD}/${nomComplet}/dashboard`}>
        <FaChartBar /> Dashboard
      </NavLink>

      <NavLink to={`${APIDASHBOARD}/${nomComplet}/evenements`}>
        <FaCalendarAlt /> Événements
      </NavLink>

      

      <NavLink to={`${APIDASHBOARD}/${nomComplet}/profil`}>
        <FaUser /> Profil
      </NavLink>
      <button onClick={handleLogout} className="inscri">
                <FaSignOutAlt /> Déconnexion
              </button>
    </div>
  );

  /* ---------------- client mobile ---------------- */
  const ClientMobileMenu = () => (
    <>
      <button className="menu" onClick={() => setOpen(!open)}>
        {open ? <FaTimes /> : <FaBars />}
      </button>

      { open && (
        <div className="mobile-menu">
          <NavLink to={`${APIDASHBOARD}/${nomComplet}/dashboard`}>
            <FaChartBar /> Dashboard
          </NavLink>

          <NavLink to={`${APIDASHBOARD}/${nomComplet}/evenements`}>
            <FaCalendarAlt /> Événements
          </NavLink>

          

          <NavLink to={`${APIDASHBOARD}/${nomComplet}/profil`}>
            <FaUser /> Profil
          </NavLink>
          <button onClick={handleLogout}  className="inscri">
                    <FaSignOutAlt /> Déconnexion
                  </button>
        </div>
      )}
    </>
  );

  /* ---------------- render ---------------- */
  const renderMenu = () => {
    if (isPublicPage) {
      return isMobile ? <PublicMobileMenu /> : <PublicDesktopMenu />;
    }

    if (isClientPage) {
      return isMobile ? <ClientMobileMenu /> : <ClientDesktopMenu />;
    }
  
    return null;
  };

  return (
  <>{!isAdminPage ? (<header>
      <div className="logo">
        <img className={!sele.value ? "cv" : ""} src={Logo} alt="logo" />
      </div>

      {sele.value && renderMenu()}
    </header>)
  : (<HeaderAdmin />) }
    </>
  );
}