<?php
// app/Http/Controllers/Api/AdminProfileController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminProfileController extends Controller
{
    /**
     * Changer le mot de passe d'un admin spécifique
     */
    public function changeAdminPassword(Request $request, $id)
    {
        $currentUser = Auth::user();

        // Vérifier si l'utilisateur est authentifié
        if (!$currentUser) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }

        // Vérifier les permissions - Accepter toutes les variations de casse pour admin
        $allowedRoles = ['admin', 'Admin', 'ADMIN', 'moderator', 'Moderator', 'MODERATOR'];
        if (!in_array($currentUser->role, $allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé. Votre rôle est: ' . $currentUser->role
            ], 403);
        }

        // Trouver l'admin cible
        $admin = Utilisateur::whereIn('role', ['admin', 'Admin', 'ADMIN', 'moderator', 'Moderator'])
            ->find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Administrateur non trouvé avec l\'ID: ' . $id
            ], 404);
        }

        // Validation avec messages d'erreur en français
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8'
        ], [
            'password.required' => 'Le nouveau mot de passe est requis',
            'password.string' => 'Le mot de passe doit être une chaîne de caractères',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas',
            'password_confirmation.required' => 'La confirmation du mot de passe est requise',
            'password_confirmation.min' => 'La confirmation doit contenir au moins 8 caractères'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Mise à jour du mot de passe
        $admin->password = Hash::make($request->password);
        $admin->save();

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe mis à jour avec succès pour ' . $admin->name,
            'admin_id' => $admin->id
        ]);
    }

    // Autres méthodes...
}
