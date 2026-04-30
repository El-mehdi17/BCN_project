import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaEnvelopeOpen, 
  FaPaperPlane, 
  FaSearch,
  FaUser,
  FaCircle,
  FaTrash,
  FaReply,
  FaTimes,
  FaCheckDouble,
  FaSpinner,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaInbox,
  FaUserFriends,
  FaUserTie
} from 'react-icons/fa';
import api from '../services/api';
import { decodeSlug } from '../utils/urlHelper';
import './css/Messages.css';

function Messages() {
  const { nomComplet } = useParams();
  const messagesEndRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // États messages
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, unread, sent
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  
  // États pour nouveau message
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newConversationMessage, setNewConversationMessage] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    sent: 0
  });

  useEffect(() => {
    fetchUserAndMessages();
  }, [nomComplet]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, currentPage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserAndMessages = async () => {
    try {
      // Récupérer le profil utilisateur
      const userResponse = await api.get(`/client/${nomComplet}/profil`);
      setUser(userResponse.data);
      
      // Récupérer les conversations
      await fetchConversations();
      await fetchStats();
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/client/${nomComplet}/messages/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get(`/client/${nomComplet}/conversations`);
      let conversationsData = response.data;
      
      // Filtrer selon le type
      if (filterType === 'unread') {
        conversationsData = conversationsData.filter(c => c.unreadCount > 0);
      }
      
      // Filtrer selon la recherche
      if (searchTerm) {
        conversationsData = conversationsData.filter(c => 
          c.user.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.lastMessage?.contenu?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setConversations(conversationsData);
      
      // Sélectionner la première conversation par défaut
      if (conversationsData.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsData[0]);
      }
    } catch (err) {
      console.error('Erreur conversations:', err);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/client/${nomComplet}/conversations/${conversationId}/messages`, {
        params: { page: currentPage }
      });
      
      setMessages(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalMessages(response.data.total);
      
      // Marquer les messages comme lus
      await markMessagesAsRead(conversationId);
    } catch (err) {
      console.error('Erreur messages:', err);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      await api.put(`/client/${nomComplet}/conversations/${conversationId}/mark-read`);
      fetchConversations();
      fetchStats();
    } catch (err) {
      console.error('Erreur marquage lu:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSending(true);
    try {
      const response = await api.post(`/client/${nomComplet}/messages`, {
        destinataire_id: selectedConversation.user.id,
        contenu: newMessage
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
      fetchConversations();
      fetchStats();
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleSendNewMessage = async () => {
    if (!newConversationMessage.trim() || !selectedUser) return;
    
    setSending(true);
    try {
      const response = await api.post(`/client/${nomComplet}/messages`, {
        destinataire_id: selectedUser.id,
        contenu: newConversationMessage
      });
      
      setSuccess('Message envoyé avec succès !');
      setTimeout(() => {
        setShowNewMessageModal(false);
        setSelectedUser(null);
        setNewConversationMessage('');
        setSuccess('');
        fetchConversations();
        
        // Trouver et sélectionner la nouvelle conversation
        const newConv = conversations.find(c => c.user.id === selectedUser.id);
        if (newConv) {
          setSelectedConversation(newConv);
        }
      }, 1500);
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Supprimer ce message ?')) return;
    
    try {
      await api.delete(`/client/${nomComplet}/messages/${messageId}`);
      setMessages(messages.filter(m => m.id !== messageId));
      fetchConversations();
      fetchStats();
      setSuccess('Message supprimé');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const searchUsers = async (term) => {
    if (term.length < 2) return;
    
    try {
      const response = await api.get(`/client/${nomComplet}/users/search`, {
        params: { search: term }
      });
      setAvailableUsers(response.data);
    } catch (err) {
      console.error('Erreur recherche utilisateurs:', err);
    }
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hier ' + messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Chargement de la messagerie...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="error-container">
        <h2>⚠️ Erreur</h2>
        <p>{error}</p>
        <Link to="/">Retour à l'accueil</Link>
      </div>
    );
  }

  const displayName = user?.nomComplet || decodeSlug(nomComplet);
  const isAdmin = user?.role === 'admin' || user?.role === 'Admin';

  return (
    <div className="messages-page">
      {/* Sidebar */}
      <aside className="messages-sidebar">
        <div className="user-header">
          <div className="user-info">
            <img 
              src={user?.photoUrl || '/default-avatar.png'} 
              alt={displayName}
              className="user-avatar-small"
            />
            <div>
              <h3>{displayName}</h3>
              <span className={`role-badge ${isAdmin ? 'admin' : 'client'}`}>
                {isAdmin ? <FaUserTie /> : <FaUser />}
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="messages-stats">
          <div className="stat-item">
            <FaInbox />
            <span>Total</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-item unread">
            <FaEnvelope />
            <span>Non lus</span>
            <strong>{stats.unread}</strong>
          </div>
          <div className="stat-item sent">
            <FaPaperPlane />
            <span>Envoyés</span>
            <strong>{stats.sent}</strong>
          </div>
        </div>

        <button 
          className="new-message-btn"
          onClick={() => setShowNewMessageModal(true)}
        >
          <FaPaperPlane /> Nouveau message
        </button>

        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchConversations();
            }}
          />
        </div>

        <div className="filter-tabs">
          <button 
            className={filterType === 'all' ? 'active' : ''}
            onClick={() => { setFilterType('all'); fetchConversations(); }}
          >
            <FaInbox /> Tous
          </button>
          <button 
            className={filterType === 'unread' ? 'active' : ''}
            onClick={() => { setFilterType('unread'); fetchConversations(); }}
          >
            <FaEnvelope /> Non lus
          </button>
        </div>

        <nav className="messages-nav">
          <Link to={`/client/${nomComplet}/dashboard`} className="nav-link">
            <FaCalendarAlt /> Dashboard
          </Link>
          <Link to={`/client/${nomComplet}/evenements`} className="nav-link">
            <FaCalendarAlt /> Événements
          </Link>
          <Link to={`/client/${nomComplet}/messages`} className="nav-link active">
            <FaEnvelope /> Messages
            {stats.unread > 0 && <span className="badge">{stats.unread}</span>}
          </Link>
          <Link to={`/client/${nomComplet}/profil`} className="nav-link">
            <FaUser /> Profil
          </Link>
          {isAdmin && (
            <Link to={`/admin/${nomComplet}/statiques`} className="nav-link admin-link">
              <FaUserTie /> Admin
            </Link>
          )}
        </nav>
      </aside>

      {/* Liste des conversations */}
      <div className="conversations-list">
        <div className="conversations-header">
          <h2>
            <FaEnvelope /> Conversations
            <span className="conversation-count">{conversations.length}</span>
          </h2>
        </div>

        <div className="conversations">
          {conversations.length > 0 ? (
            conversations.map(conv => (
              <div
                key={conv.user.id}
                className={`conversation-item ${selectedConversation?.user.id === conv.user.id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conversation-avatar">
                  <img 
                    src={conv.user.photoUrl || '/default-avatar.png'} 
                    alt={conv.user.nomComplet}
                  />
                  {conv.user.online && <span className="online-indicator"></span>}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{conv.user.nomComplet}</h4>
                    <span className="conversation-time">
                      {formatDate(conv.lastMessage?.dateEnvoi || conv.updatedAt)}
                    </span>
                  </div>
                  <p className="last-message">
                    {conv.lastMessage?.contenu || 'Aucun message'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
                <div className="conversation-role">
                  <span className={`mini-role ${conv.user.role === 'admin' ? 'admin' : 'client'}`}>
                    {conv.user.role === 'admin' ? 'Admin' : 'Client'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-conversations">
              <FaInbox />
              <p>Aucune conversation</p>
              <button onClick={() => setShowNewMessageModal(true)}>
                Démarrer une conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="chat-area">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <img 
                  src={selectedConversation.user.photoUrl || '/default-avatar.png'} 
                  alt={selectedConversation.user.nomComplet}
                />
                <div>
                  <h3>{selectedConversation.user.nomComplet}</h3>
                  <span className={`user-role-badge ${selectedConversation.user.role === 'admin' ? 'admin' : 'client'}`}>
                    {selectedConversation.user.role}
                  </span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="action-btn" title="Marquer comme lu">
                  <FaCheckDouble />
                </button>
              </div>
            </div>

            <div className="messages-container">
              {messages.length > 0 ? (
                messages.map(message => {
                  const isSentByMe = message.expediteur_id === user.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`message-wrapper ${isSentByMe ? 'sent' : 'received'}`}
                    >
                      {!isSentByMe && (
                        <img 
                          src={selectedConversation.user.photoUrl || '/default-avatar.png'} 
                          alt=""
                          className="message-avatar"
                        />
                      )}
                      <div className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}>
                        <p className="message-content">{message.contenu}</p>
                        <div className="message-meta">
                          <span className="message-time">
                            {formatDate(message.dateEnvoi)}
                          </span>
                          {isSentByMe && (
                            <span className="message-status">
                              {message.lu ? <FaCheckDouble className="read" /> : <FaCheckDouble />}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSentByMe && (
                        <button 
                          className="delete-message-btn"
                          onClick={() => handleDeleteMessage(message.id)}
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="no-messages">
                  <FaEnvelopeOpen />
                  <p>Aucun message</p>
                  <p className="hint">Commencez la conversation !</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <FaChevronLeft />
                </button>
                <span>Page {currentPage} / {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="message-input-form">
              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <button type="submit" disabled={!newMessage.trim() || sending}>
                {sending ? <FaSpinner className="spinner-icon" /> : <FaPaperPlane />}
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <FaEnvelopeOpen />
            <h3>Sélectionnez une conversation</h3>
            <p>Ou démarrez une nouvelle conversation</p>
            <button onClick={() => setShowNewMessageModal(true)}>
              <FaPaperPlane /> Nouveau message
            </button>
          </div>
        )}
      </div>

      {/* Modal nouveau message */}
      {showNewMessageModal && (
        <div className="modal-overlay">
          <div className="new-message-modal">
            <div className="modal-header">
              <h3><FaPaperPlane /> Nouveau message</h3>
              <button onClick={() => setShowNewMessageModal(false)} className="close-modal">
                <FaTimes />
              </button>
            </div>

            {success && (
              <div className="success-message">
                <FaCheckDouble /> {success}
              </div>
            )}
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {!selectedUser ? (
              <div className="user-selection">
                <div className="search-box-modal">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      searchUsers(e.target.value);
                    }}
                  />
                </div>

                <div className="users-list">
                  {availableUsers.length > 0 ? (
                    availableUsers.map(u => (
                      <div 
                        key={u.id} 
                        className="user-item"
                        onClick={() => setSelectedUser(u)}
                      >
                        <img src={u.photoUrl || '/default-avatar.png'} alt={u.nomComplet} />
                        <div className="user-item-info">
                          <h4>{u.nomComplet}</h4>
                          <span className={`mini-role ${u.role === 'admin' ? 'admin' : 'client'}`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : userSearchTerm.length >= 2 ? (
                    <p className="no-results">Aucun utilisateur trouvé</p>
                  ) : (
                    <p className="search-hint">
                      {isAdmin ? 'Recherchez un client ou un admin' : 'Recherchez un administrateur'}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="message-composition">
                <div className="selected-user-info">
                  <img src={selectedUser.photoUrl || '/default-avatar.png'} alt={selectedUser.nomComplet} />
                  <div>
                    <h4>{selectedUser.nomComplet}</h4>
                    <span className={`mini-role ${selectedUser.role === 'admin' ? 'admin' : 'client'}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="change-user">
                    Changer
                  </button>
                </div>

                <textarea
                  placeholder="Votre message..."
                  value={newConversationMessage}
                  onChange={(e) => setNewConversationMessage(e.target.value)}
                  rows="5"
                />

                <div className="modal-actions">
                  <button onClick={() => setShowNewMessageModal(false)} className="cancel-btn">
                    Annuler
                  </button>
                  <button 
                    onClick={handleSendNewMessage} 
                    className="send-btn"
                    disabled={!newConversationMessage.trim() || sending}
                  >
                    {sending ? <FaSpinner className="spinner-icon" /> : <FaPaperPlane />}
                    Envoyer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;