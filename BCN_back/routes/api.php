<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EvenementController;
use App\Http\Controllers\Api\ParticipantController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ClientDashboardController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Routes Publiques (Sans Authentification)
|--------------------------------------------------------------------------
*/

// Auth

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/change_mot_de_pass',[AuthController::class,"change_mot_de_pass"]);

// Événements publics (consultation seulement)
Route::get("/evenements/nbrCLient/{id}",[EvenementController::class,"clientEnregistre"]);
Route::get('/evenements/somme-prix-en-attente', [EvenementController::class, 'sommePrixEnAttente']);
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{id}', [EvenementController::class, 'show']);
Route::get('/statistics', [EvenementController::class, 'statistics']);
Route::post("/takeToken",[AuthController::class,"takeToken"]);

/*
|--------------------------------------------------------------------------
| Routes Protégées (Nécessitent Authentification Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // ==================== AUTH ====================
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);




    // ==================== ADMIN PROFILE ====================
    Route::prefix('admin/profile')->group(function () {
        Route::get('/', [AdminProfileController::class, 'show']);
        Route::put('/update', [AdminProfileController::class, 'update']);
        Route::post('/update-avatar', [AdminProfileController::class, 'updateAvatar']);
        Route::put('/change-password', [AdminProfileController::class, 'changePassword']);
    });
Route::middleware('auth:sanctum')->post(
   '/client/{id}/updatEavatar',
   [ClientDashboardController::class, 'updateAvatarClient']
);
    // ==================== CLIENT ====================
    Route::prefix('client')->group(function () {
        //pour localStorage
        Route::get("/emailprofile/{email}", [ClientDashboardController::class, 'getClientByemail']);

        // Dashboard
        Route::get('/{nomComplet}/dashboard', [ClientDashboardController::class, 'dashboard']);
        Route::get('/{nomComplet}/evenements', [ClientDashboardController::class, 'evenements']);
        Route::get('/{nomComplet}/messages', [ClientDashboardController::class, 'messages']);
        Route::get('/{nomComplet}/profil', [ClientDashboardController::class, 'profil']);
        Route::put('/{nomComplet}/profil', [ClientDashboardController::class, 'updateProfil']);
        Route::post('/{nomComplet}/upload-photo', [ClientDashboardController::class, 'uploadPhoto']);
        Route::put('/{nomComplet}/change-password', [ClientDashboardController::class, 'changePassword']);

        // Participations
        Route::post('/evenements/{eventId}/register', [ParticipantController::class, 'register']);
        Route::post('/evenements/{eventId}/cancel', [ParticipantController::class, 'cancel']);
        Route::get('/my-participations', [ParticipantController::class, 'myParticipations']);
        // Evenements
        Route::get('/evenements', [EvenementController::class, 'index']);

        // Messages
        Route::get('/conversations', [MessageController::class, 'conversations']);
        Route::get('/conversations/{userId}/messages', [MessageController::class, 'messages']);
        Route::post('/messages', [MessageController::class, 'send']);
        Route::put('/conversations/{userId}/mark-read', [MessageController::class, 'markAsRead']);
        Route::get('/messages/stats', [MessageController::class, 'stats']);
        Route::get('/evenements', [EvenementController::class, 'index']);
    });

    // ==================== ADMIN ====================
    Route::prefix('admin')->group(function () {

        // --- Dashboard ---
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/dashboard-stats', [AdminController::class, 'dashboardStats']);
        Route::get('/clients/count', [ClientDashboardController::class, 'getClientCount']);
        Route::get('/clients/per-month', [ClientDashboardController::class, 'getclientsPerMonth']);
        Route::get('/clients', [ClientDashboardController::class, 'getClient']);
        // --- Événements (CRUD) ---
        Route::get('/evenements', [EvenementController::class, 'index']);
        Route::post('/evenements', [EvenementController::class, 'store']);
        Route::get('/evenements/{id}', [EvenementController::class, 'show']);
        Route::put('/evenements/{id}', [EvenementController::class, 'update']);
        Route::delete('/evenements/{id}', [EvenementController::class, 'destroy']);

        // --- Participants ---
        Route::get('/evenements/{eventId}/participants', [ParticipantController::class, 'eventParticipants']);
        Route::get('/evenements/{id}/participants/count', [ParticipantController::class, 'CountParticipants']);
        Route::patch('/participations/{participantId}/statut', [ParticipantController::class, 'updateStatus']);
        Route::delete('/participants/{participantId}', [ParticipantController::class, 'destroy']);

        // --- Upload Images ---
        Route::post('/upload-image', [AdminController::class, 'uploadImage']);
        Route::post('/upload-event-image', [EvenementController::class, 'uploadEventImage']);
        Route::post('/evenements/upload-image', [EvenementController::class, 'uploadImage']); // Route unifiée

        // --- Gestion Admins (CRUD) ---
        Route::get('/admins', [AdminController::class, 'listAdmins']);
        Route::post('/admins', [AdminController::class, 'registerAdmin']);
        Route::get('/admins/{id}', [AdminController::class, 'showAdmin']);
        Route::put('/admins/{id}', [AdminController::class, 'updateAdmin']);
        Route::delete('/admins/{id}', [AdminController::class, 'deleteAdmin']);
        Route::put('/admins/{id}/change-password', [AdminController::class, 'changeAdminPassword']);
        Route::post('/admins/{id}/update-avatar', [AdminController::class, 'updateAvatar']);

        // --- Messages ---
        Route::get('/messages', [MessageController::class, 'index']);
        Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
        Route::delete('/messages/{messageId}', [MessageController::class, 'destroy']);
    });

    // ==================== ROUTES PARTAGÉES (Admin + Client) ====================

    // Événements
    Route::post('/evenements', [EvenementController::class, 'store']);
    Route::put('/evenements/{id}', [EvenementController::class, 'update']);
    Route::delete('/evenements/{id}', [EvenementController::class, 'destroy']);
    Route::get('/my-events', [EvenementController::class, 'myEvents']);

    // Participants
    Route::post('/evenements/{eventId}/register', [ParticipantController::class, 'register']);
    Route::post('/evenements/{eventId}/cancel', [ParticipantController::class, 'cancel']);
    Route::get('/my-participations', [ParticipantController::class, 'myParticipations']);
    Route::get('/evenements/{id}/participants/count', [ParticipantController::class, 'CountParticipants']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/users/search', [MessageController::class, 'searchUsers']);
});

/*
|--------------------------------------------------------------------------
| Routes de Service (Images, Debug)
|--------------------------------------------------------------------------
*/

// Servir les images stockées (contourne le problème 403 sur Windows)
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);

    if (!file_exists($fullPath)) {
        abort(404, 'Fichier non trouvé');
    }

    $mimeType = mime_content_type($fullPath);
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    if (!in_array($mimeType, $allowedTypes)) {
        abort(403, 'Type de fichier non autorisé');
    }

    return response()->file($fullPath, [
        'Content-Type' => $mimeType,
        'Access-Control-Allow-Origin' => '*',
        'Cache-Control' => 'public, max-age=31536000'
    ]);
})->where('path', '.*')->name('storage.file');

/*
|--------------------------------------------------------------------------
| Routes de Développement (À SUPPRIMER EN PRODUCTION)
|--------------------------------------------------------------------------
*/

Route::post('/dev/login', function(Request $request) {
    $user = \App\Models\Utilisateur::where('email', $request->email)->first();

    if (!$user) {
        $user = new \App\Models\Utilisateur();
        $user->nomComplet = $request->email ? explode('@', $request->email)[0] : 'User';
        $user->email = $request->email;
        $user->password = \Illuminate\Support\Facades\Hash::make($request->password ?? 'password123');
        $user->role = $request->role ?? 'utilisateur';
        $user->profileCompleted = true;
        $user->dateInscription = now();
        $user->save();
    }

    $token = $user->createToken('dev-token')->plainTextToken;

    return response()->json([
        'success' => true,
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => $user
    ]);
});

Route::get('/debug-users', function() {
    $users = \App\Models\Utilisateur::all();
    return response()->json([
        'total_users' => $users->count(),
        'users' => $users->map(fn($user) => [
            'id' => $user->id,
            'nomComplet' => $user->nomComplet,
            'email' => $user->email,
            'role' => $user->role,
        ])
    ]);
});

Route::get('/routes', function() {
    $routes = collect(Route::getRoutes())->map(function ($route) {
        return [
            'method' => implode('|', $route->methods()),
            'uri' => $route->uri(),
            'name' => $route->getName(),
            'action' => $route->getActionName(),
        ];
    });

    return response()->json($routes);
});
Route::options('/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
})->where('any', '.*');
