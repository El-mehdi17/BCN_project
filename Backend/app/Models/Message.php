<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $table = 'messages';
    
    protected $fillable = [
        'contenu',
        'dateEnvoi',
        'lu',
        'luLe',
        'expediteur_id',
        'destinataire_id'
    ];

    protected $casts = [
        'dateEnvoi' => 'datetime',
        'luLe' => 'datetime',
        'lu' => 'boolean',
    ];

    //les relations
    public function expediteur()
    {
        return $this->belongsTo(Utilisateur::class, 'expediteur_id');
    }

    public function destinataire()
    {
        return $this->belongsTo(Utilisateur::class, 'destinataire_id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('lu', false);
    }

    public function scopeBetween($query, $user1Id, $user2Id)
    {
        return $query->where(function($q) use ($user1Id, $user2Id) {
            $q->where('expediteur_id', $user1Id)
              ->where('destinataire_id', $user2Id);
        })->orWhere(function($q) use ($user1Id, $user2Id) {
            $q->where('expediteur_id', $user2Id)
              ->where('destinataire_id', $user1Id);
        });
    }

    // Methods
    public function markAsRead()
    {
        $this->update([
            'lu' => true,
            'luLe' => now()
        ]);
    }
}