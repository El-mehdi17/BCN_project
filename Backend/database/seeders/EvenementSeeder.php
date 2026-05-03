<?php

namespace Database\Seeders;

use App\Models\Evenement;
use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EvenementSeeder extends Seeder
{
    public function run(): void
    {
       
        $user = Utilisateur::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'nomComplet' => 'Admin Test',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'profileCompleted' => true,
                'dateInscription' => now(),
            ]
        );

   
        
        $evenements = [
            [
                'titre' => 'Conférence Tech 2024',
                'description' => 'La plus grande conférence tech au Maroc',
                'lieu' => 'Casablanca',
                'date' => now()->addDays(15),
                'prix' => 299.99,
                'typePrix' => 'payant',
                'capaciteMax' => 500,
                'imageUrl' => 'evenements/tech.jpg',
                'createdBy_id' => $user->id,
            ],
            [
                'titre' => 'Workshop Laravel',
                'description' => 'Formation complète sur Laravel 11',
                'lieu' => 'Rabat',
                'date' => now()->addDays(7),
                'prix' => 0,
                'typePrix' => 'gratuit',
                'capaciteMax' => 50,
                'imageUrl' => 'evenements/laravel.jpg',
                'createdBy_id' => $user->id,
            ],
            [
                'titre' => 'Networking Professionnel',
                'description' => 'Rencontrez des professionnels de votre secteur',
                'lieu' => 'Marrakech',
                'date' => now()->addDays(30),
                'prix' => 150.00,
                'typePrix' => 'payant',
                'capaciteMax' => 100,
                'imageUrl' => 'evenements/networking.jpg',
                'createdBy_id' => $user->id,
            ],
        ];

        foreach ($evenements as $event) {
            Evenement::create($event);
        }
        
        echo "✅ " . count($evenements) . " événements créés avec succès!\n";
    }
}