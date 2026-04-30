<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    use HasFactory;

    protected $table = 'participants';
    
    protected $fillable = [
        'dateInscription',
        'statut',
        'utilisateur_id',
        'evenement_id'
    ];

    protected $casts = [
        'dateInscription' => 'datetime',
    ];

    // les Relations
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function evenement()
    {
        return $this->belongsTo(Evenement::class, 'evenement_id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
 //Une fonction flexible qui vous permet de filtrer les participants en fonction de n'importe quel statut que vous leur envoyez.       
        return $query->where('statut', $status);
    }

    public function scopeConfirmed($query)
    {
//Un filtre rapide pour ne retenir que les participants dont la présence a été « confirmée ».        

        return $query->where('statut', 'confirmé');
    }

    public function scopePending($query)
    {
//Un filtre rapide pour récupérer les commandes qui sont encore « en attente ».        
        return $query->where('statut', 'en_attente');
    }
}