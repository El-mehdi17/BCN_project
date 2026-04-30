import "./css/Footer.css"
import ico from "./img/icons/cobcn.png"
import { NavLink } from "react-router-dom"
import { FaFacebookF,FaInstagram,FaLinkedinIn } from "react-icons/fa"
import { useDispatch  } from "react-redux"
import { setOK } from "../redux/redux"
import { setActive } from "../redux/redux"

export default function Footer(){
    let dispatch=useDispatch()
let da=new Date()

    return(
        <div className="footer">
            <div className="bani">
                <div className="f1">
                    <img src={ico} alt="" />
                    <p>
                        Le réseau de référence pour les

professionnels ambitieux. Connecter les

talents, créer des opportunités, innover

ensemble.
                    </p>
                </div>
                <div className="f2">
                  <h4>Quick Links</h4>
                   <NavLink to="/accueil"  onClick={()=>{dispatch(setActive('a'));dispatch(setOK(true))}} >Accueil</NavLink>
                  <NavLink to="/accueil#propos">À propos</NavLink>
                  <NavLink to="/accueil#Galerie">Galerie</NavLink>
                  <NavLink to="/accueil#contact">Contact</NavLink>
                  <NavLink to="/Actualite"  onClick={()=>dispatch(setActive("e"))} >Actualité</NavLink>
                </div>
                <div className="f3">
                    <h4>Informations</h4>
                    <p className="g">contact@bcn-casablanca.com</p>
                    <p>+212 623-456789</p>
                    <p>Casablanca, Maroc</p>
                </div>
            </div>
            <hr  />
            <div className="fin">
                <p>@ {da.getFullYear()} Business Club Networking (BCN). Tous droits réservés. Création par <a style={{textDecoration:"underline 1px #ccc"}} href="https://brt-solutions.com/">BRT Solutions</a></p>
                <div className="icofin">
 <a className="a1" href="https://www.facebook.com/brt.solutions/"><FaFacebookF /></a>
<a className="a2" href="https://www.instagram.com/brt_solution/"> <FaInstagram /></a>
<a className="a3" href="https://www.linkedin.com/company/brt-solutions/"><FaLinkedinIn /></a> 
                </div>
            </div>
        </div>
    )
}