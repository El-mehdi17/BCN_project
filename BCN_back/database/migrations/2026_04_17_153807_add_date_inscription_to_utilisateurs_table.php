<?php
// database/migrations/2024_01_17_000000_add_date_inscription_to_utilisateurs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            if (!Schema::hasColumn('utilisateurs', 'dateInscription')) {
                $table->date('dateInscription')->nullable()->after('entrepriseNom');
            }
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn('dateInscription');
        });
    }
};