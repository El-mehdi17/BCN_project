import { useState,useEffect } from "react";
import { NavLink,useLocation, useNavigate  } from "react-router-dom";
import './css/Accueil.css'
import { setOK } from "../redux/redux";
import heroImg from './img/Hero.png'
import icO from './img/icons/IC.png'
import icV from './img/icons/Icv.png'
import aprops from './img/Aprops.png'
import ContactForm from "./ContactForm";
import Footer from "./Footer";
import { setActive,setWasf  } from "../redux/redux";
import { useDispatch } from "react-redux";


export default function Accueil(){

  const navigate = useNavigate();


  const location = useLocation();

useEffect(() => {
  if (location.hash) {
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);

    if (el) { 
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth" });

        
        window.history.replaceState(null, "", location.pathname);
      }, 100);
    }
  }
}, [location]);

  

   let [width,setWidth]=useState(window.innerWidth)
   useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  
  /// dispatch est ici
    let dispatch=useDispatch()

const images = Object.values(
  import.meta.glob('./img/photos/*.png', { eager: true })
).map((module ) => module.default);
  const data = images.map((img, f) => ({
    Img: img,
     i: f
  }));
  useEffect(()=>{
    if(location.pathname=="/Accueil"){
       dispatch(setOK(true))
    }
  },[])
  
    return(
        <section className="secyy">
        <div className="black">

            <div className="black_text">
                <h1>Connectez, 
                    <i> Évoluez</i>,<i> Réussissez</i> avec
                    BCN
                </h1>
                <p>Le réseau d'affaires incontournable pour les
                   professionnels ambitieux. Rejoignez une
                   communauté d'élite pour accélérer votre croissance
                </p>
               <div className="button"><NavLink style={{color:"#fff",}} onClick={()=>dispatch(setActive('e'))} to="/inscription"><button className="btn-1" style={{color:"#fff",padding:"16px 24px"}}>Inscription</button></NavLink><NavLink to="/connexion"><button className="btn-d-h">Connexion</button></NavLink></div> 
                <p style={{borderLeft:"2px solid #A81B1B",paddingLeft:"20px",fontSize:"13.8px",textAlign:"left"}}>BCN (Business Club Networking) rassemble les leaders
                    d'aujourd'hui et de demain autour de valeurs fortes et
                    d'opportunités concrètes.
                </p>
            </div>
            <img src={heroImg} alt="Hero" />
        </div>
<div id="propos" className="white">
<div className="codep"><img  className="pro" src={aprops} alt="À Propos du BCN" /></div>
     <div>
        {/* <h2>À Propos du BCN</h2> 7777777777777777777777777777
        777777777777777777777777777777777777777777777777777777777*/}
        <div className="pord">
                <h2 style={{color:"#A81B1B"}}>À Propos du BCN</h2>
                <p>Le Business Club Networking est un écosystème exclusif
                   conçu pour dynamiser les échanges entre décideurs,
                   entrepreneurs et experts de tous secteurs.</p>

        </div>
      <ul>
        <li>
           <div className="ico">
            <h3 className="h3i">Nos Objectifs</h3>
           
                <span className="t3"><img   src={icO} alt="Icon Objectifs" /></span>
                <p>Créer des synergies professionnelles puissantes, encourager le
                   partage de connaissances de haut niveau et faciliter l'émergence
                   de nouvelles opportunités d'affaires stratégiques.</p></div>
        </li>
        <li>
          <div className="ico ">
            <h3  className="r3" >Nos Valeurs</h3>
            
                <span  className="t1" style={{marginTop:"-240px"}}><img src={icV}  alt="Icon Valeurs" /></span>
                <p>Nous cultivons l'excellence dans chacun de nos événements,
                   l'entraide sincère entre nos membres, l'innovation continue et une
                   intégrité absolue dans les affaires.</p></div>
        </li>
      </ul>

     </div>
</div>
<div id="Galerie" className="Galerie">
    <div className="text">
        <h2>Notre Galerie</h2>
        <p>Revivez nos événements exclusifs, conférences inspirantes et

           rencontres de networking stratégiques.</p>
    </div>
    <div className="iiPo">
    {data.filter((_, index) =>{ if(width<=768 ){
          return  index < 3
       }
    return true
}) .map((img, index) => (           
    <img className="iip" style={{cursor:"pointer"}}onClick={() => {
  dispatch(setWasf(img));
  navigate("/Actualite");
}} key={index} src={img.Img} alt="photo" loading="lazy" />
  ))}
</div> 
</div>
 
<div id="contact">
  <ContactForm />
</div>

<Footer />
        </section>

    )
}