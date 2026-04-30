<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evenement extends Model
{
    use HasFactory;

    protected $table = 'evenements';

    protected $fillable = [
        'titre',
        'description',
        'lieu',
        'date',
        'prix',
        'typePrix',
        'capaciteMax',
        'imageUrl',
        'createdBy_id'
    ];

    protected $casts = [
        'date' => 'datetime',
        'prix' => 'decimal:2',
        'capaciteMax' => 'integer',


    ];

// relations
    public function createur()
    {
        return $this->belongsTo(Utilisateur::class, 'createdBy_id');
    }

    public function participants()
    {
        return $this->hasMany(Participant::class, 'evenement_id');
    }

    // Accessors
    public function getImageUrlAttribute($value)
    {
//Si l'image existe, elle récupère son lien complet depuis le stockage ; si elle est vide, elle récupère une image par défaut.
   return $value
        ? asset('storage/' . $value)
        : asset('default-event.jpg');
    }

    public function getPlacesRestantesAttribute()
    {
//Calculer le nombre de places restantes (capacité maximale - nombre actuel de participants)
        return $this->capaciteMax - $this->participants()->count();
    }

    public function getEstCompletAttribute()
    {
//Elle renvoie une valeur logique (vrai/faux) pour nous indiquer si la fonction est pleine ou non.
        return $this->places_restantes <= 0;
    }

    public function getEstPasseAttribute()
    {
//Vérifiez si la date de l'événement est passée par rapport à l'heure actuelle.
        return $this->date < now();
    }

    // Scopes
    public function scopeUpcoming($query)
    {
//Pour n'afficher que les événements à venir (ceux dont l'historique est antérieur à aujourd'hui).
        return $query->where('date', '>', now());
    }

    public function scopeByType($query, $type)
    {
//Filtrer les événements par type de prix.
        return $query->where('typePrix', $type);
    }

    public function scopeNotFull($query)
    {
//Requête avancée permettant de ne récupérer que les événements ayant encore des places disponibles, en comparant le nombre de participants à la capacité maximale.
        return $query->whereHas('participants', function($q) {
            $q->havingRaw('COUNT(*) < evenements.capaciteMax');
        });
    }
}
