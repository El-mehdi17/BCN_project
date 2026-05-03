<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminProfileController;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);


// routes/web.php - Route temporaire pour tester

Route::get('/test-images', function () {
    $files = Storage::disk('public')->files('avatars/admins');

    echo "<h1>Images disponibles</h1>";
    echo "<p>Dossier: avatars/admins</p>";
    echo "<p>Nombre de fichiers: " . count($files) . "</p>";

    foreach ($files as $file) {
        $url = Storage::disk('public')->url($file);
        echo "<div style='margin:10px; display:inline-block; text-align:center'>";
        echo "<img src='$url' width='100' height='100' style='border-radius:50%; object-fit:cover'><br>";
        echo "<small>$file</small><br>";
        echo "<a href='$url' target='_blank'>Voir</a>";
        echo "</div>";
    }

    echo "<hr>";
    echo "<h2>Debug</h2>";
    echo "<p>Storage path: " . storage_path('app/public') . "</p>";
    echo "<p>Public path: " . public_path('storage') . "</p>";
    echo "<p>Lien symbolique: " . (is_link(public_path('storage')) ? '✅ OUI' : '❌ NON') . "</p>";

    if (is_link(public_path('storage'))) {
        echo "<p>Cible: " . readlink(public_path('storage')) . "</p>";
    }
});
