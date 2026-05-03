import "../css/Message.css";
import { useState, useRef, useEffect,useMemo } from "react";
                              
import {CheckCheck ,Check,Search,UserRound,Paperclip,MessageSquareMore,Smile,AudioLines,Mic,Smartphone  ,Send } from "lucide-react"

export default function Messages() {
  const [time, setTime] = useState({ h: 0, m: 0 });
 

  useEffect(() => {
    const x = setInterval(() => {
      const date = new Date();
      setTime({
        h: date.getHours(),
        m: date.getMinutes(),
      });
    }, 50);

    // Nettoyage de l’intervalle
    return () => clearInterval(x);
  }, []);




  const [activeUserId, setActiveUserId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const users = [
    { id: 1, name: "Nasim BN", msg: "Bonjour, je souhaiterais ...", time: "il y a 2 heures", online: true, lastSeen: "En ligne" },
    { id: 2, name: "Soad Banoun", msg: "Merci pour l'événement ...", time: "Hier", online: false, lastSeen: "Vu hier à 20:45" },
    { id: 3, name: "Oussama Orfi", msg: "Est-il possible de mettre ...", time: "il y a 2 jours", online: true, lastSeen: "En ligne" },
    { id: 4, name: "Hiba Abyad", msg: "Bonjour, je souhaiterais ...", time: "il y a 2 jours", online: false, lastSeen: "Vu à 15:30" },
    { id: 5, name: "Hassan Idrissi", msg: "c'était très instructif ...", time: "il y a 2 jours", online: false, lastSeen: "Vu hier" },
    { id: 6, name: "Isame Qadiri", msg: "je souhaiterais savoir si ...", time: "il y a 4 jours", online: true, lastSeen: "En ligne" },
  ];
const [sech, setSech] = useState(null); 
const [searchTerm, setSearchTerm] = useState("");

const search = (x) => {
  setSearchTerm(x);
  if (x.trim() === "") {
    setSech(null);
  } else {
    const filteredUsers = users.filter((user) => 
      user.name.toLowerCase().includes(x.toLowerCase())
    );
    setSech(filteredUsers);
  }
};

  const defaultMessages = {
    1: [
      { id: 1, text: "Bonjour, je souhaiterais avoir plus d'informations sur les prochains événements.", sender: "user", time: "10:30", seen: true },
      { id: 2, text: "Bonjour Hiba ! Bien sûr, nous avons un événement prévu le 25 novembre. Je vous envoie les détails.", sender: "me", time: "10:32", seen: true },
      { id: 3, text: "Merci beaucoup ! Je suis intéressée.", sender: "user", time: "10:33", seen: false },
    ],
    2: [
      { id: 1, text: "Merci pour l'événement d'hier, c'était très enrichissant !", sender: "user", time: "09:15", seen: true },
      { id: 2, text: "Content que cela vous ait plu ! À bientôt.", sender: "me", time: "09:20", seen: true },
    ],
    3: [
      { id: 1, text: "Est-il possible de mettre à jour mon profil entreprise avec le nouveau logo ?", sender: "user", time: "14:45", seen: true },
      { id: 2, text: "Oui, c'est tout à fait possible. Allez dans Paramètres > Profil > Modifier l'image.", sender: "me", time: "14:50", seen: true },
      { id: 3, text: "Parfait, merci beaucoup !", sender: "user", time: "14:52", seen: false },
    ],
    4: [
      { id: 1, text: "Bonjour, je souhaiterais m'inscrire à la newsletter.", sender: "user", time: "11:00", seen: true },
      { id: 2, text: "Bonjour ! Je vous inscris tout de suite.", sender: "me", time: "11:05", seen: true },
    ],
    5: [
      { id: 1, text: "c'était très instructif comme présentation.", sender: "user", time: "16:20", seen: true },
      { id: 2, text: "Merci pour votre retour !", sender: "me", time: "16:25", seen: true },
    ],
    6: [
      { id: 1, text: "je souhaiterais savoir si la formation est certifiante.", sender: "user", time: "13:10", seen: true },
      { id: 2, text: "Oui, elle est certifiante. Je vous envoie le programme.", sender: "me", time: "13:15", seen: true },
    ],
  };

  useEffect(() => {
    if (Object.keys(messages).length === 0) {
      setMessages(defaultMessages);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeUserId]);

  useEffect(() => {
    if (activeUserId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeUserId]);

  const images = Object.values(
    import.meta.glob("../imges/membres/*.png", { eager: true })
  ).map(m => m.default);

  const activeUser = users.find(u => u.id === activeUserId);
  const activeMessages = messages[activeUserId] || [];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: newMessage,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: true
    };

    setMessages(prev => ({
      ...prev,
      [activeUserId]: [...(prev[activeUserId] || []), newMsg]
    }));

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    setShowSidebar(true);
    setActiveUserId(null);
  };

  const selectUser = (userId) => {
    setActiveUserId(userId);
    setShowSidebar(false);
  };

  const formatLastSeen = (user) => {
    if (user.online) return "🟢 En ligne";
    return (<>Compte Professionnel </>);
  };

  return (
    <div className="whatsapp-container">
      {/* Barre d'état style WhatsApp */}
      <div className="status-bar">
        <span>{time.h}:{time.m < 10 ? `0${time.m}` : time.m}</span>
        
      </div>

      {/* Interface principale */}
      <div className={`whatsapp-interface ${!showSidebar ? 'chat-open' : ''}`}>
        
        {/* Sidebar - Liste des discussions */}
        <div className={`whatsapp-sidebar ${!showSidebar ? 'hidden' : ''}`}>
          <div className="sidebar-header">
            <div className="header-left">
              <h1>Discussions</h1>
            </div>
            <div className="header-icons">
             
              <button className="icon-btn">⋮</button>
            </div>
          </div>

          <div className="search-bar">
          <span className="search-icon"><Search size={18} /></span>
          <input 
           type="text" 
           placeholder="Rechercher ou démarrer une nouvelle discussion" 
           value={searchTerm}
           onChange={(e) => search(e.target.value)}
          />
          </div>

          <div className="users-list">
           {sech === null ? (
  // Afficher tous les utilisateurs
  users.map((user, index) => {
    const userMessages = messages[user.id] || [];
    const lastMessage = userMessages[userMessages.length - 1];
    const unreadCount = userMessages.filter(m => m.sender === "user" && !m.seen).length;
    
    return (
      <div
        key={user.id}
        className="whatsapp-user-item"
        onClick={() => selectUser(user.id)}
      >
        <div className="user-avatar">
          <img src={images[index % images.length]} alt={user.name} />
          {user.online && <span className="online-indicator"></span>}
        </div>
        
        <div className="user-info">
          <div className="user-name-line">
            <h4>{user.name}</h4>
            <span className="message-time">{user.time}</span>
          </div>
          <div className="message-preview">
            {lastMessage && (
              <>
                {lastMessage.sender === "me" && <span><UserRound size={12} />: </span>}
                <p className="preview-text">{lastMessage.text}</p>
              </>
            )}
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </div>
        </div>
      </div>
    );
  })
) : sech.length > 0 ? (
  // Afficher les résultats de recherche
  sech.map((user, index) => {
    const userMessages = messages[user.id] || [];
    const lastMessage = userMessages[userMessages.length - 1];
    const unreadCount = userMessages.filter(m => m.sender === "user" && !m.seen).length;
    const originalIndex = users.findIndex(u => u.id === user.id);
    
    return (
      <div
        key={user.id}
        className="whatsapp-user-item"
        onClick={() => selectUser(user.id)}
      >
        <div className="user-avatar">
          <img src={images[originalIndex % images.length]} alt={user.name} />
          {user.online && <span className="online-indicator"></span>}
        </div>
        
        <div className="user-info">
          <div className="user-name-line">
            <h4>{user.name}</h4>
            <span className="message-time">{user.time}</span>
          </div>
          <div className="message-preview">
            {lastMessage && (
              <>
                {lastMessage.sender === "me" && <span><UserRound size={12} />: </span>}
                <p className="preview-text">{lastMessage.text}</p>
              </>
            )}
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </div>
        </div>
      </div>
    );
  })
) : (
  // Aucun résultat trouvé
  <div className="no-results">
    <p>Aucun contact trouvé pour "{searchTerm}"</p>
  </div>
)}
          </div>
        </div>

        {/* Zone de chat */}
        <div className={`whatsapp-chat ${!showSidebar ? 'active' : ''}`}>
          {activeUser ? (
            <>
              {/* En-tête du chat */}
              <div className="chat-header-wa">
                <button className="back-button" onClick={handleBack}>
                  ←
                </button>
                <div className="chat-user-info" onClick={() => setShowSidebar(false)}>
                  <div className="chat-avatar">
                    <img 
                      src={images[users.findIndex(u => u.id === activeUserId) % images.length]} 
                      alt={activeUser.name} 
                    />
                  </div>
                  <div className="user-details">
                    <h3>{activeUser.name}</h3>
                    <p className="last-seen">{formatLastSeen(activeUser)}</p>
                  </div>
                </div>
                <div className="chat-actions">
                  
                  <button className="icon-btn">⋮</button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container-wa">
                <div className="messages-wrapper">
                  {activeMessages.map((msg, idx) => (
                    <div
                      key={msg.id || idx}
                      className={`message-wa ${msg.sender === "me" ? "message-sent" : "message-received"}`}
                    >
                      <div className="message-bubble-wa">
                        <p>{msg.text}</p>
                        <div className="message-footer">
                          <span className="message-time-wa">{msg.time}</span>
                          {msg.sender === "me" && (
                            <span className="message-status">
                              {msg.seen ? <CheckCheck /> : <Check />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input d'envoi de message */}
              <div className="input-container-wa">
                <button className="emoji-btn"><Smile /></button>
                <input
                  ref={inputRef}
                  type="text"
                  className="message-input-wa"
                  placeholder="Message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button className="attach-btn"><Paperclip /></button>
                {newMessage.trim() ? (
                  <button className="send-btn-wa" onClick={handleSendMessage}>
                    <Send />
                  </button>
                ) : (
                  <button className="mic-btn"><Mic /></button>
                )}
              </div>
            </>
          ) : (
            <div className="no-chat-selected-wa">
              <div className="whatsapp-logo"><MessageSquareMore /></div>
              <h2>Message Web</h2>
              <p>Choisissez une discussion pour commencer à chatter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}