<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->dateTime('dateInscription')->default(now());
            $table->string('statut')->default('en_attente'); // en_attente, confirmé, annulé
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->foreignId('evenement_id')->constrained('evenements')->onDelete('cascade');
            $table->timestamps();
            
          
            $table->unique(['utilisateur_id', 'evenement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};