<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UtilisateurController extends Controller
{
    /**
     * Récupérer les informations de l'utilisateur connecté.
     */
    public function show(Request $request)
    {
        return response()->json([
            'utiliateurs' => $request->user()
        ]);
    }

    /**
     * Mettre à jour le profil (Finaliser l'inscription).
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Validation des données
        $validator = Validator::make($request->all(), [
            'poste' => 'required|string|max:255',
            'ville' => 'required|string|max:255',
            'entrepriseNom' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Mise à jour des informations
        $user->update([
            'poste' => $request->poste,
            'ville' => $request->ville,
            'entrepriseNom' => $request->entrepriseNom,
            'profileComplited' => true, // On marque le profil comme complété
        ]);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'utilisateurs' => $user
        ]);
    }
}
