<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomComplet' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:utilisateurs,email',
            'password' => 'required|string|min:8|confirmed',
            'poste' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'entrepriseNom' => 'nullable|string|max:255',
            'role' => 'nullable|string|max:20'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $utilisateur = Utilisateur::create([
            'nomComplet' => $request->nomComplet,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'poste' => $request->poste,
            'active'=> false,
            'ville' => $request->ville,
            'entrepriseNom' => $request->entrepriseNom,
            'role' => $request->role ?? 'Client',
            'profileCompleted' => false,
            'dateInscription' => now(),
        ]);

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $utilisateur
        ], 201);
    }

    /**
     * ✅ Login - Version corrigée (role optionnel)
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
            'role' => 'nullable|string'  // ✅ Rendre optionnel
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        \Log::info('=== TENTATIVE DE CONNEXION ===');
        \Log::info('Email: ' . $request->email);
        \Log::info('Role reçu: ' . ($request->role ?? 'non spécifié'));

        // ✅ Recherche par email uniquement d'abord
        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user) {
            \Log::info('❌ Email non trouvé');
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        \Log::info('✅ Utilisateur trouvé - Role DB: ' . $user->role);

        // ✅ Si un rôle est spécifié, vérifier qu'il correspond (insensible à la casse)
        if ($request->role && strtolower($user->role) !== strtolower($request->role)) {
            \Log::info('❌ Rôle incorrect - Attendu: ' . $request->role . ', Actuel: ' . $user->role);
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé pour ce rôle'
            ], 403);
        }

        // ✅ Vérification du mot de passe
        if (!Hash::check($request->password, $user->password)) {
            \Log::info('❌ Mot de passe incorrect');
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        \Log::info('✅ Connexion réussie');

        // Supprimer les anciens tokens
        $user->tokens()->delete();

        // Créer nouveau token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Vérifier si admin (insensible à la casse)
        $isAdmin = in_array(strtolower($user->role), ['admin']);

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'is_admin' => $isAdmin,
            'user' => [
                'id' => $user->id,
                'nomComplet' => $user->nomComplet,
                'email' => $user->email,
                'role' => $user->role,
                'photoUrl' => $user->photoUrl,
                'ville' => $user->ville,
                "active" => $user->active,
                'entrepriseNom' => $user->entrepriseNom,
                'poste' => $user->poste,
                'profileCompleted' => $user->profileCompleted,
                'dateInscription' => $user->dateInscription
            ]
        ]);
    }

    /**
     * ✅ Login spécifique pour admin (utilisé par /admin/login)
     */
  public function adminLogin(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $user = Utilisateur::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Email ou mot de passe incorrect'
        ], 401);
    }


    if (!in_array(strtolower($user->role), ['admin', 'administrateur'])) {
        return response()->json([
            'success' => false,
            'message' => 'Accès réservé aux administrateurs'
        ], 403);
    }


    $user->tokens()->delete();


    $token = $user->createToken('admin-token')->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Connexion administrateur réussie',
        'access_token' => $token,
        'token_type' => 'Bearer',
        'user' => [
            'id' => $user->id,
            'nomComplet' => $user->nomComplet,
            'email' => $user->email,
            'role' => $user->role,
            'photoUrl' => $user->photoUrl,
            'poste' => $user->poste,
            'ville' => $user->ville,
        ]
    ]);
}
    /**
     * ✅ Inscription d'un nouvel administrateur
     */
    public function registerAdmin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomComplet' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'required|string|min:8|confirmed',
            'poste' => 'nullable|string',
            'ville' => 'nullable|string',
            'entrepriseNom' => 'nullable|string',
            'photoUrl' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $admin = Utilisateur::create([
            'nomComplet' => $request->nomComplet,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'poste' => $request->poste ?? 'Administrateur',
            'ville' => $request->ville,
            'active' => true,
            'entrepriseNom' => $request->entrepriseNom,
            'photoUrl' => $request->photoUrl,
            'role' => 'admin',
            'profileCompleted' => true,
            'dateInscription' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Administrateur créé avec succès',
            'admin' => $admin
        ], 201);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $user = $request->user();

       if ($user && $user->currentAccessToken()) {
    $user->currentAccessToken()->delete();
}

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Utilisateur actuel
     */

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
                            'success' => false,
                            'message' => 'Non authentifié'
                                ], 401);
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'nomComplet' => $user->nomComplet,
                'email' => $user->email,
                'role' => $user->role,
                'photoUrl' => $user->photoUrl,
                'ville' => $user->ville,
                'entrepriseNom' => $user->entrepriseNom,
                'poste' => $user->poste,
                'profileCompleted' => $user->profileCompleted,
                'dateInscription' => $user->dateInscription,
                "active" => $user->active,
            ]
        ]);
    }

    /**x
     * Mise à jour du profil
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomComplet' => 'sometimes|string|max:255',
            'poste' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            "telephone" => "nullable|string|max:20",
            'entrepriseNom' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('profiles', 'public');
            $user->photoUrl = asset('storage/' . $path);
        }

        $user->update($request->only([
            'nomComplet', 'poste', 'ville', 'entrepriseNom', 'telephone'
        ]));



        $user->profileCompleted = $this->isProfileComplete($user);
          if($user->profileCompleted ) {
            $user->active = true;
        }
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'user' => $user
        ]);
    }

    /**
     * Changement de mot de passe
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [

            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Le mot de passe actuel est incorrect.'
            ], 400);
        }

        $user->password = Hash::make($request->new_password);

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié avec succès'
        ]);
    }

    /**
     * Mot de passe oublié
     */
public function forgotPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:utilisateurs,email'
    ], [
        'email.exists'   => 'Cet email n’existe pas.',
        'email.email'    => 'Email invalide.',
        'email.required' => 'Email obligatoire.'
    ]);

    // récupérer user correctement
    $user = Utilisateur::where('email', $request->email)->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Utilisateur introuvable'
        ], 404);
    }

    // supprimer ancien token reset
    DB::table('password_reset_tokens')->where('email', $request->email)->delete();

    // créer token reset
    $token = Str::random(64);

    DB::table('password_reset_tokens')->insert([
        'email' => $request->email,
        'token' => Hash::make($token),
        'created_at' => now()
    ]);

    // lien React Frontend
    $resetLink = "http://localhost:5173/Cmdp?token=$token&email=".$request->email;

    // envoyer email
    Mail::html("
        <div style='font-family:Arial;padding:30px'>
            <h2 style='color:#0d6efd'>Réinitialisation du mot de passe</h2>
            <p>Bonjour {$user->nomComplet},</p>
            <p>Cliquez sur le bouton ci-dessous :</p>

            <a href='$resetLink'
               style='background:#0d6efd;color:white;
               padding:12px 25px;
               text-decoration:none;
               border-radius:6px;
               display:inline-block'>
               Réinitialiser
            </a>

            <p style='margin-top:20px;color:gray'>
                Ce lien expire bientôt.
            </p>
        </div>
    ", function ($message) use ($request) {
        $message->to($request->email)
                ->subject('Réinitialisation mot de passe');
    });

    return response()->json([
        'success' => true,
        'message' => 'Lien envoyé avec succès'
    ]);
}

    /**
     * Réinitialisation du mot de passe
     */

public function resetPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'token' => 'required',
        'password' => 'required|min:8|confirmed'
    ], [
        'email.required' => 'Email obligatoire',
        'token.required' => 'Token manquant',
        'password.required' => 'Mot de passe obligatoire',
        'password.confirmed' => 'Les mots de passe ne correspondent pas'
    ]);

    // chercher token
    $reset = DB::table('password_reset_tokens')
        ->where('email', $request->email)
        ->first();

    if (!$reset) {
        return response()->json([
            'success' => false,
            'message' => 'Lien invalide'
        ], 400);
    }

    // vérifier token
    if (!Hash::check($request->token, $reset->token)) {
        return response()->json([
            'success' => false,
            'message' => 'Token incorrect'
        ], 400);
    }

    // vérifier expiration (60 min)
    if (now()->diffInMinutes($reset->created_at) > 60) {
        return response()->json([
            'success' => false,
            'message' => 'Lien expiré'
        ], 400);
    }

    // chercher user
    $user = Utilisateur::where('email', $request->email)->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Utilisateur introuvable'
        ], 404);
    }

    // changer password
    $user->password = Hash::make($request->password);
    $user->remember_token = Str::random(60);
    $user->save();

    // supprimer token utilisé
    DB::table('password_reset_tokens')
        ->where('email', $request->email)
        ->delete();

    return response()->json([
        'success' => true,
        'message' => 'Mot de passe modifié avec succès'
    ]);
}

    /**
     * Google OAuth - Redirection
     */
    
    /**
     * Vérifier si le profil est complet
     */
    private function isProfileComplete($user)
    {
        return !empty($user->nomComplet) &&
               !empty($user->poste) &&
               !empty($user->ville) &&
               !empty($user->entrepriseNom);
    }

#################################################################################################à
   public function change_mot_de_pass(Request $req){
     $validator = Validator::make($req->all(), [
              'email' => 'required|email',
              'password' => 'required|min:8|confirmed',
              ],
              ['email.required' => 'Email obligatoire',
              'email.email' => 'Email invalide',
               'password.required' => 'Mot de passe obligatoire',
                          'password.min' => 'Minimum 8 caractères',
                            'password.confirmed' => 'Les mots de passe ne correspondent pas',
                             ]);
                                 if ($validator->fails()) {
                                return response()->json([
                                      'success' => false,
                                      'errors' => $validator->errors()
                                           ], 422);    }
                $user = Utilisateur::where('email', $req->email)->first();
                if (!$user) {
                return response()->json([
                       'success' => false,
                        'message' => 'Email introuvable'], 404);
                                                            }
        $user->password = Hash::make($req->password);
        $user->save();
        return response()->json([ 'success' => true,
               'message' => 'Mot de passe changé avec succès' ], 200);

               }

################################################################################################


    public function takeToken(Request $request)
{
    $valid = Validator::make($request->all(), [
        "email" => 'required|email'
    ]);

    if ($valid->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $valid->errors()
        ], 422);
    }

    $user = Utilisateur::where('email', $request->email)->first();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Email introuvable dans la base de données'
        ], 404);
    }

    // Générer token
    $plainToken = Str::random(60);
    $hashedToken = Hash::make($plainToken);

    DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $request->email],
        [
            'email' => $request->email,
            'token' => $hashedToken,
            'created_at' => now()
        ]
    );

    return response()->json([
        'success' => true,
        'message' => 'Token généré avec succès',
        'token' => $plainToken
    ]);
}
}

