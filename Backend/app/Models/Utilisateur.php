<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


namespace App\Models;
use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Url;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Auth\CanResetPassword;  // ✅ Important
use Illuminate\Auth\Passwords\CanResetPassword as CanResetPasswordTrait;

class Utilisateur extends Authenticatable implements CanResetPassword
{
    use HasApiTokens, Notifiable,CanResetPasswordTrait,Notifiable;

    // IMPORTANT : Indiquer le nom de la table personnalisée
    protected $table = 'utilisateurs';

   protected $fillable = [
        'nomComplet',
        'email',
        'password',
        "telephone",
        'avatar',
        'photoUrl',
        'poste',
        'ville',
        'entrepriseNom',
        'dateInscription',
        'role',
        'profileCompleted',

    ];

    protected $hidden = ['password', 'remember_token'];

     protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'dateInscription' => 'date',
        'profileCompleted' => 'boolean',

    ];
      public function getDateInscriptionAttribute()
    {
        return $this->created_at->format('Y-m-d');
    }

    // --- RELATIONS DU SCHÉMA ---

    /** Événements créés par cet utilisateur */
    public function evenementsCrees() {
        return $this->hasMany(Evenement::class, 'createdBy_id');
    }

    /** Participations aux événements */
    public function participations() {
        return $this->hasMany(Participant::class, 'utilisateur_id');
    }

    /** Messages envoyés */
    public function messagesEnvoyes() {
        return $this->hasMany(Message::class, 'expediteur_id');
    }

    /** Messages reçus */
    public function messagesRecus() {
        return $this->hasMany(Message::class, 'destinataire_id');
    }
        public function scopeClients($query)
    {
        return $query->where('role', ["Client","client"]);
    }
       public function scopeAdmins($query)
    {
        return $query->whereIn('role', ['admin', 'Admin']);
    }
      public function getIsAdminAttribute()
    {
        return in_array($this->role, ['admin', 'Admin']);
    }

     public function getAvatarUrlAttribute()
    {
        return $this->photoUrl;
    }
    public function getPhotoUrlAttribute()
    {
        if ($this->avatar) {
            // Vérifier si c'est déjà une URL complète
            if (filter_var($this->avatar, FILTER_VALIDATE_URL)) {
                return $this->avatar;
            }

            // Si le fichier existe dans le stockage public
            if (Storage::disk('public')->exists($this->avatar)) {
                return Storage::disk('public')->url($this->avatar);
            }

            // Fallback: construire l'URL manuellement
            return asset('storage/' . $this->avatar);
        }

        return null;
    }

    /**
     * ✅ Obtenir l'URL de l'avatar (alias)
     */

}
