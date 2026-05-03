<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id();
            $table->string('nomComplet');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
        
        // input de google
            $table->string('google_id')->nullable()->unique(); 
            $table->string('avatar')->nullable();
            $table->string('password')->nullable(); // mot de pass de user
            $table->string("poste");
            $table->string("telephone");
            $table->string("ville");
            $table->string("role")->default('Client');
            $table->string("entrepriseNom");
            $table->boolean("profileCompleted")->default(false);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};
