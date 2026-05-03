import './css/ContactForm.css';
import lin from "./img/Icons/link.png"
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import emailjs from '@emailjs/browser';
import { useState } from 'react';

export default function ContactForm({test}) {
  const serviceId = import.meta.env.VITE_SERVICE_EMAILJS;
const templateId = import.meta.env.VITE_TEMPLATE_EMAILJS;
const publicKey = import.meta.env.VITE_CLIENT_ID_EMAILJS;
  const [formData, setFormData] = useState({
    title: "Demande d'inscription",
    name: "",
  email: "",
  phone: "",
  message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.send(
      serviceId,
      templateId ,
      formData,
      publicKey
    )
    .then(() => {
      alert("Message envoyé !");
    })
    .catch((error) => {
      console.log(error);
    });
  };

let listlien=[
  "http://localhost:5174/accueil",
"https://brt-solutions.com/",
"https://www.aliexpress.com/",
"https://www.fiverr.com/?msockid=235a54527ab5662e1fa242b07b266789",
"https://www.netflix.com/ma-fr/",
"https://www.tiktok.com/explore",
"https://www.upwork.com/",
"https://www.youtube.com/"



]
// 🔽🔽 comme loop de les images 
let images=Object.values(
  import.meta.glob("./img/partenaires/*.png",{eager:true})
).map((module)=>module.default)


  return (
    <>
    <section id={test} className="contact">
      
      {/* LEFT */}
      <div className="left">
        <h1>
          Contactez-nous 
        </h1>

        <p>
          Rejoignez l'élite professionnelle. Remplissez le formulaire
          d'inscription pour soumettre votre candidature au club ou pour toute demande d'information.
        </p>

        <div className="social">
          <div className="item">
            <span className="icon"><FaFacebookF /></span>
            <span>Facebook BCN</span>
          </div>

          <div className="item">
            <span className="icon"><FaInstagram /></span>
            <span>@bcn_officiel</span>
          </div>

          <div className="item">
             <span className="icon">
    < FaLinkedinIn  />
  </span>
            <span>Business Club Networking</span>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="right">
        <form onSubmit={sendEmail} method='post'>
          <label>Nom complet</label>
          <input type="text" name='name' placeholder="Ex : Mohammed Kadire" onChange={handleChange}/>

          <label>Email professionnel</label>
          <input type="email" name='email' placeholder="example@gmail.com" onChange={handleChange}/>

          <label>Téléphone</label>
          <input type="text" name='phone' placeholder="+212 657-209317" onChange={handleChange} />

          <label>Message ou motivations</label>
          <textarea placeholder="Décrivez brièvement votre parcours et vos attentes..." name="message" onChange={handleChange}></textarea>

          <button type="submit" className='btn-2'>Soumettre la demande</button>
        </form>
      </div>

    </section>
    <div className="bottom">
      <div className="track1">
  {images.map((Img,i)=>(
   <div className='img' key={i}><a href={listlien[i]}><img  src={Img} style={{width: "220px",
  height: "auto",
  padding: "40px"}} alt='icon' loading='lazy' /></a> </div>
  )
  )}
  </div>
     <div className="track2" style={styles.track2}>
  {images.map((Img,i)=>(
   <div style={styles.img} className='img' key={i}> <a href={listlien[i]}><img src={Img} style={styles.d}  alt='icon' loading='lazy' /></a> </div>
  )
  )}
  </div>
</div>
</>
  );
}
let styles={
  track2 :{
  display: "flex",
  gap: "40px",
  position: "absolute",
  Zindex: 1,
  whiteSpace: "nowrap",
},
  track1 :{
  display: "flex",
  gap: "40px",
  position: "absolute",
  Zindex: 1,
  whiteSpace: "nowrap",
},
img:{
  flex:"0 0 auto"
},
d:{
  width:"220px",
  height:"auto",
  padding:"40px"
}
}