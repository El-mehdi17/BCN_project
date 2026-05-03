import { configureStore } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

let des = [
  `La Soirée de Gala Annuelle de BCN est un événement prestigieux réunissant des dirigeants, entrepreneurs et partenaires dans un cadre élégant et inspirant.
C'est une occasion unique de célébrer les réussites de l'année, renforcer les relations professionnelles et créer de nouvelles opportunités de collaboration.

Détails de l'événement :
  Date : À définir
  Lieu : Hôtel ou salle de réception prestigieuse
  Dress Code : Tenue de soirée élégante
  Accès : Membres BCN & invités VIP

Programme :
  Accueil & cocktail de bienvenue
  Dîner de gala
  Discours des invités d'honneur
  Remise de distinctions
  Networking & échanges

Objectif :
Créer un moment d'exception pour célébrer la communauté BCN et renforcer les liens entre les acteurs du monde professionnel.`,

  'Le développement de la location de matériel, les vélos électriques, etc. Esprit sportif et innovation technologique dans le domaine du sport.',

  'Compétences professionnelles : Accueil, gestion planning, Excel, classement. Qualités personnelles : Organisation, rigueur, aisance relationnelle, qualités rédactionnelles.',

  'Types d\'entretien : Sous pression (le recruteur crée un malaise). B = Structuré (il suit une grille). C = Amical / Non structuré (il cherche à créer une relation de confiance).',

  "Le Griot (Géwël en wolof) est à la fois musicien, historien, généalogiste et ambassadeur de paix. À chaque cérémonie — mariage, baptême (Nguenté), retour de La Mecque — le griot chante les louanges des familles, rappelle l'histoire des clans. Ses instruments : le Kora (harpe-luth à 21 cordes), le Balafon (xylophone africain), le Xalam (luth traditionnel wolof).",

  'Comportement du recruteur : Le recruteur ne vous regarde presque pas. Il prend des notes frénétiquement sans lever la tête. Il vous interrompt au milieu de vos phrases pour poser une autre question sans vous laisser terminer.'
]

let ti = [
  'Une soirée exclusive dédiée aux leaders, entrepreneurs et membres du Business Club Networking.',
  "Location de Matériel Sportif",
  "Compétences Professionnelles ",
  "Types d'Entretien ",
  "La Culture du Griot ",
  "Comportement du Recruteur "
]
// Création du slice
let setx = createSlice({
  name: "copie",
  initialState: { value: true },
  reducers: {
    setOK: (state, action) => {
      state.value = action.payload
    }
  }
})

let hi=createSlice({
  name:"auth",
  initialState:{user:null},
  reducers:{
    setUser:(state,action)=>{
      state.user=action.payload
    }
  }
})

let wasf = createSlice({
  name: "wasfy",
  initialState: { Img: "", Titre: "", des: "", i: 0 },
  reducers: {
    setWasf: (state, action) => {
      if (!action.payload) return;

      // Update image if provided
      if (action.payload.Img !== undefined) {
        state.Img = action.payload.Img;
      }
      
      // Get the index from payload or use current state
      const index = action.payload.i !== undefined ? action.payload.i : state.i;
      
      // Update title and description based on index
      // Make sure index exists in arrays
      if (ti[index]) {
        state.Titre = ti[index];
      } else {
        state.Titre = `Titre ${index + 1}`; // Fallback
      }
      
      if (des[index]) {
        state.des = des[index];
      } else {
        state.des = "Description non disponible"; // Fallback
      }
      
      // Update the index
      if (action.payload.i !== undefined) {
        state.i = action.payload.i;
      }
    }
  }
})

let slice = createSlice({
  name: "navigation",
  initialState: { a: true, b: false, c: false, d: false, e: false ,f:false},
  reducers: {
    setActive: (state, action) => {
      const key = action.payload;
      // Réinitialiser toutes les clés à false
      Object.keys(state).forEach((k) => (state[k] = false));
      // Activer uniquement la clé choisie
      state[key] = true;
    },
  },
});

// Export des actions
export const { setOK } = setx.actions;
export const { setWasf } = wasf.actions
export const { setActive } = slice.actions;
export const { setUser } = hi.actions;

// Export du store
export const store = configureStore({
  reducer: {
    navigation: slice.reducer,
    copie: setx.reducer,
    wasfy: wasf.reducer,
    auth: hi.reducer
  },
});