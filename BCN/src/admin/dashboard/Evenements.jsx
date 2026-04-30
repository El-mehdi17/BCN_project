import { useState, useRef, useEffect } from "react";
import { Pencil, Plus, ImagePlus, Loader2, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import eventService from "../services/eventService";
import axios from '../services/api'; 
import "../css/Evenements.css";

const evdate=import.meta.env.VITE_event_update
export default function Evenement() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // États du formulaire
  const [editingId, setEditingId] = useState(id || null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    lieu: "",
    date: "",
    prix: "",
    typePrix: "participant",
    capaciteMax: "50"
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Image par défaut
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80";
  
  // ✅ Taille maximale : 5 Mo
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo en octets

  // ✅ Charger l'événement si on est en mode édition
  useEffect(() => {
    if (editingId) {
      loadEvent(editingId);
    }
  }, [editingId]);

const loadEvent = async (eventId) => {
  setLoading(true);
  try {
    const response = await eventService.getEvent(eventId);
    const event = response.data;
    
    setForm({
      titre: event.titre || "",
      description: event.description || "",
      lieu: event.lieu || "",
      date: event.date ? event.date.split('T')[0] : "",
      prix: event.prix ? event.prix.toString() : "",
      typePrix: event.typePrix || "participant",
      capaciteMax: event.capaciteMax?.toString() || "50",
      
    });
    
    // ✅ Gérer l'image existante
    if (event.imageUrl) {
      setImagePreview(event.imageUrl);
    } else {
      setImagePreview(DEFAULT_IMAGE);
    }
  } catch (error) {
    showToast(error.message || "Erreur lors du chargement", "error");
  } finally {
    setLoading(false);
  }
};

  // Afficher une notification
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ✅ Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ✅ Gestion des images - Accepte TOUTES les tailles < 5Mo
  const handleImageFile = (file) => {
    if (!file) return;
    
    // Vérifier le type d'image
    if (!file.type.startsWith("image/")) {
      showToast("❌ Veuillez sélectionner une image valide (PNG, JPG, JPEG, WEBP, GIF)", "error");
      return;
    }

    console.log(file)
    // ✅ Vérifier la taille (max 5Mo) - AUCUNE restriction de dimensions
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      showToast(`❌ L'image est trop volumineuse (${fileSizeMB} Mo). Maximum autorisé : 5 Mo`, "error");
      return;
    }
    
    // ✅ Créer une prévisualisation (peut être lente pour les très grandes images)
      const reader = new FileReader();
      reader.onload = (e) => {
      setImagePreview(e.target.result);
      
      // ✅ Message de succès avec la taille
      const fileSize = formatFileSize(file.size);
      showToast(`✅ Image chargée avec succès ! (${fileSize})`, "success");
    };
    reader.onerror = () => {
      showToast("❌ Erreur lors de la lecture de l'image", "error");
    };
    reader.readAsDataURL(file);

    setImageFile(file);
  };


  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  // ✅ Upload d'image avec compression optionnelle
// ✅ Version corrigée



// ✅ Dans uploadImage() - Remplacer l'URL
const uploadImage = async () => {
  if (!imageFile) {
    console.log('ℹ️ Aucun fichier à uploader');
    return null;
  }
  
  setUploading(true);
  
  try {
    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      throw new Error('Non authentifié');
    }
    
   
    
    const formData = new FormData();
    formData.append('imageUrl', imageFile);
    
    // ✅ URL dynamique
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    
    const response = await axios.post(
      `/admin/${evdate}`,    
      formData,
      { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          
        }
      }
    );
    
    console.log('✅ Upload réussi:', response.data);
    
    if (response.data.success && response.data.url) {
      showToast('✅ Image uploadée avec succès!', 'success');
      
      return response.data.url;
    } else {
      throw new Error(response.data.message || 'URL non reçue');
    }
    
  } catch (error) {
    
    console.error('❌ Erreur upload:', error);
    
    let errorMessage = 'Erreur lors de l\'upload';
    
    if (error.response) {
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
      
      if (error.response.status === 401) {
        errorMessage = 'Session expirée, veuillez vous reconnecter';
        setTimeout(() => navigate('/'), 2000);
      } else if (error.response.status === 413) {
        errorMessage = 'Image trop volumineuse (max 5 Mo)';
      } else if (error.response.status === 422) {
        errorMessage = error.response.data.message || 'Format d\'image non supporté';
      } else {
        errorMessage = error.response.data.message || 'Erreur serveur';
      }
    } else if (error.request) {
      errorMessage = 'Impossible de contacter le serveur';
    } else {
      errorMessage = error.message;
    }
    
    showToast('❌ ' + errorMessage, 'error');
    return null;
  } finally {
    setUploading(false);
  }
};

  // ✅ Retirer l'image
  const handleRemoveImage = () => {
    setImagePreview(DEFAULT_IMAGE);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast("🖼️ Image retirée", "info");
  };

  // ✅ Soumettre le formulaire (Création)

const handleSubmit = async () => {
  if (!form.titre.trim()) {
    showToast("❌ Le titre est requis", "error");
    return;
  }

  if (!form.date) {
    showToast("❌ La date est requise", "error");
    return;
  }

  setLoading(true);
  try {
    let imageUrl = DEFAULT_IMAGE;
    if (imageFile) {
      try {
        const uploadResult = await uploadImage();
        if (uploadResult) {
          imageUrl = uploadResult;
        }
      } catch (uploadError) {
        console.error('Erreur upload:', uploadError);
        showToast("⚠️ L'image n'a pas pu être uploadée", "error");
        imageUrl = DEFAULT_IMAGE;
      }
    }

    const eventData = {
      titre: form.titre.trim(),
      description: form.description.trim() || "",
      lieu: form.lieu.trim() || "À confirmer",
      date: form.date,
      prix: form.prix ? parseFloat(form.prix) : 0,
      typePrix: form.prix && parseFloat(form.prix) > 0 ? "payant" : "gratuit",
      capaciteMax: parseInt(form.capaciteMax) || 50,
      imageUrl: imageUrl
    };

   

    const response = await eventService.createEvent(eventData);
    
    
    showToast("🎉 Événement créé avec succès !");
    
    setTimeout(() => {
      navigate('/admin/statistique');
    }, 1500);
    
  } catch (error) {
    console.error('❌ Erreur complète:', error);
    

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
      
  
      const errorMessage = error.response.data.message || 
                          error.response.data.error ||
                          JSON.stringify(error.response.data);
      
      showToast(`❌ Erreur serveur: ${errorMessage}`, "error");
      
      // En cas d'erreurs de validation
      if (error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat().join('\n');
        showToast(`❌ ${errors}`, "error");
      }
    } else {
      showToast(error.message || "Erreur lors de la création", "error");
    }
  } finally {
    setLoading(false);
  }
};

  // ✅ Mettre à jour
  const handleUpdate = async () => {
    if (!form.titre.trim()) {
      showToast("❌ Le titre est requis", "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload de la nouvelle image si changée
      let imageUrl = imagePreview;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // 2. Mettre à jour l'événement
      const eventData = {
        titre: form.titre.trim(),
        description: form.description.trim(),
        lieu: form.lieu.trim(),
        date: form.date,
        prix: form.prix ? parseFloat(form.prix) : 0,
        typePrix: form.prix && parseFloat(form.prix) > 0 ? "payant" : "gratuit",
        capaciteMax: parseInt(form.capaciteMax) || 50,
        imageUrl: imageUrl
      };

      await eventService.updateEvent(editingId, eventData);
      
      showToast("✅ Événement mis à jour !");
      
      setTimeout(() => {
        navigate('/evenements');
      }, 1500);
      
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      showToast(error.message || "❌ Erreur lors de la mise à jour", "error");
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setEditingId(null);
    setForm({
      titre: "",
      description: "",
      lieu: "",
      date: "",
      prix: "",
      typePrix: "participant",
      capaciteMax: "50"
    });
    setImagePreview(DEFAULT_IMAGE);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading && editingId) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Chargement de l'événement...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>
            {toast.type === "error" ? "❌" : 
             toast.type === "success" ? "✅" : 
             toast.type === "info" ? "ℹ️" : "📢"}
          </span>
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="form-card">
        {/* En-tête du formulaire */}
        <div className="form-header">
          <h2>
            {editingId ? (
              <><Pencil size={20} /> Modifier l'événement</>
            ) : (
              <><Plus size={20} /> Créer un événement</>
            )}
          </h2>
          <p>
            {editingId 
              ? "Modifiez les informations de votre événement" 
              : "Remplissez le formulaire pour créer un nouvel événement"
            }
          </p>
        </div>

        {/* Formulaire */}
        <div className="form-body">
          {/* Colonne gauche - Champs */}
          <div className="form-fields">
            {/* Titre */}
            <div className="field-group">
              <label className="field-label">
                Titre de l'événement <span className="required">*</span>
              </label>
              <input
                type="text"
                className="field-input"
                placeholder="Ex: Dîner des Leaders"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                disabled={loading || uploading}
              />
            </div>

            {/* Description */}
            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea
                className="field-textarea"
                rows="4"
                placeholder="Décrivez brièvement votre événement..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={loading || uploading}
              />
            </div>

            {/* Lieu */}
            <div className="field-group">
              <label className="field-label">Lieu</label>
              <input
                type="text"
                className="field-input"
                placeholder="Ex: Casablanca, Maroc"
                value={form.lieu}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                disabled={loading || uploading}
              />
            </div>

            {/* Ligne triple : Date, Prix, Capacité */}
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Date</label>
                <input
                  type="date"
                  className="field-input"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  disabled={loading || uploading}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="field-group">
                <label className="field-label">
                  Prix (DH)
                  <span className="field-hint">(0 = Gratuit)</span>
                </label>
                <input
                  type="number"
                  className="field-input"
                  placeholder="Ex: 1200"
                  value={form.prix}
                  onChange={(e) => setForm({ ...form, prix: e.target.value })}
                  disabled={loading || uploading}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Capacité max</label>
                <input
                  type="number"
                  className="field-input"
                  placeholder="Ex: 50"
                  value={form.capaciteMax}
                  onChange={(e) => setForm({ ...form, capaciteMax: e.target.value })}
                  disabled={loading || uploading}
                  min="1"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="form-buttons">
              {editingId ? (
                <>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleUpdate}
                    disabled={loading || uploading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spinner-small" />
                        Mise à jour...
                      </>
                    ) : (
                      "Mettre à jour"
                    )}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={resetForm}
                    disabled={loading || uploading}
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSubmit}
                    disabled={loading || uploading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spinner-small" />
                        Création...
                      </>
                    ) : (
                      "Créer l'événement"
                    )}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={resetForm}
                    disabled={loading || uploading}
                  >
                    Effacer
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ✅ Colonne droite - Upload d'image (Accepte TOUTES les tailles < 5Mo) */}
          <div className="image-upload">
            <label className="field-label">
              Image de l'événement
              <span className="field-hint"> (Optionnel - Max 5 Mo)</span>
            </label>

            <div
              className={`dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !uploading && !loading && fileInputRef.current?.click()}
            >
              {uploading ? (
                <div className="upload-placeholder">
                  <Loader2 size={40} className="spinner" />
                  <span>Upload en cours...</span>
                  {imageFile && (
                    <span className="upload-size">
                      {formatFileSize(imageFile.size)}
                    </span>
                  )}
                </div>
              ) : imagePreview ? (
                <div className="image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu de l'événement"
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                  {imageFile && (
                    <div className="image-info">
                      <span className="file-size">{formatFileSize(imageFile.size)}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    disabled={loading}
                  >
                    <X size={16} /> Retirer
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">
                    <ImagePlus size={70} />
                  </div>
                  <div className="upload-text">
                    <span className="upload-link">Cliquez ou glissez</span>
                    <span>une image</span>
                  </div>
                  <div className="upload-hint">
                    PNG, JPG, JPEG, WEBP, GIF
                  </div>
                  <div className="upload-hint">
                    Taille max : 5 Mo (toutes dimensions acceptées)
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              name="imageUrl"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageFile(e.target.files[0])}
              disabled={loading || uploading}
            />
            
            {/* ✅ Message d'aide */}
            <p className="image-help-text">
              ✅ Toutes les dimensions d'image sont acceptées.<br/>
              L'image sera automatiquement optimisée si nécessaire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}