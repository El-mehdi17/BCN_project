<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->text('contenu');
            $table->dateTime('dateEnvoi')->default(now());
            $table->boolean('lu')->default(false);
            $table->dateTime('luLe')->nullable();
            $table->foreignId('expediteur_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->foreignId('destinataire_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->timestamps();
            
           
            $table->index(['expediteur_id', 'destinataire_id']);
            $table->index('lu');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};