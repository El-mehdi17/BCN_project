<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Facades\Validator;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

use Intervention\Image\Laravel\Facades\Image;

class ClientDashboardController extends Controller
{
    /**
     * Profil du client
     */
    public function profil(Request $request, $nomComplet)
{
    try {
        // المستخدم الحالي عبر token
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }


        $nomDecode = urldecode(str_replace('-', ' ', $nomComplet));


        $user = Utilisateur::where('nomComplet', $nomDecode)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // حماية: لا يمكن مشاهدة بروفايل شخص آخر
        if ($authUser->id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'nomComplet' => $user->nomComplet,
                'email' => $user->email,
                'role' => $user->role,
                'photoUrl' => $user->photoUrl,
                'ville' => $user->ville,
                'telephone' => $user->telephone,
                'entrepriseNom' => $user->entrepriseNom,
                'poste' => $user->poste,
                'profileCompleted' => $user->profileCompleted,
                'dateInscription' => $user->dateInscription,
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('Erreur profil client: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du chargement du profil'
        ], 500);
    }
}

    /**
     * Dashboard client
     */
    public function dashboard(Request $request, $nomComplet)
{
    try {
       // L'utilisateur connecté
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }

      // Décoder le slug provenant de l'URL
        $nomDecode = urldecode(str_replace('-', ' ', $nomComplet));

       // Trouver l'utilisateur
        $user = Utilisateur::where('nomComplet', $nomDecode)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

       // Protection : Empêche une autre personne d'ouvrir le tableau de bord
        if ((int) $authUser->id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé'
            ], 403);
        }

        // Sélectionner uniquement les données pouvant être renvoyées
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
                'profileCompleted' => (bool) $user->profileCompleted,
            ],

            'stats' => [
                'total_evenements' => 0,
                'mes_participations' => 0,
                'messages_non_lus' => 0
            ],

            'evenements_a_venir' => [],
            'derniers_messages' => []
        ]);

    } catch (\Exception $e) {

        \Log::error('Erreur dashboard client: '.$e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du chargement du dashboard'
        ], 500);
    }
}

    /**
     * Mise à jour du profil
     */
   public function updateProfil(Request $request, $nomComplet)
{
    try {
        // L'utilisateur connecté
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }

        // Decode slug
        $nomDecode = urldecode(str_replace('-', ' ', $nomComplet));

        // Rechercher l'utilisateur à partir du lien
        $user = Utilisateur::where('nomComplet', $nomDecode)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Protection: Empêche la modification d'un compte d'une autre personne
        if ((int)$authUser->id !== (int)$user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        // Validation forte
        $validated = $request->validate([
            'nomComplet'     => 'sometimes|string|min:3|max:255',
            'ville'          => 'nullable|string|max:255',
            'telephone'      => 'nullable|string|regex:/^[0-9+\-\s()]{8,20}$/',
            'entrepriseNom'  => 'nullable|string|max:255',
            'poste'          => 'nullable|string|max:255',
        ]);

        // Empêcher la modification du role / email / password même s'ils sont envoyés
        unset(
            $validated['role'],
            $validated['email'],
            $validated['password'],
            $validated['id']
        );

        $user->update($validated);

        // actualizar el estado de completitud del perfil
        $user->profileCompleted =
            filled($user->nomComplet) &&
            filled($user->ville) &&
            filled($user->entrepriseNom) &&
            filled($user->poste);

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'id' => $user->id,
                'nomComplet' => $user->nomComplet,
                'email' => $user->email,
                'role' => $user->role,
                'ville' => $user->ville,
                'telephone' => $user->telephone,
                'entrepriseNom' => $user->entrepriseNom,
                'poste' => $user->poste,
                'profileCompleted' => $user->profileCompleted,
            ]
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors()
        ], 422);

    } catch (\Exception $e) {
        \Log::error('Erreur update profil: '.$e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
        ], 500);
    }
}
    /**
     * Événements du client
     */
    public function evenements(Request $request, $nomComplet)
{
    try {
        // L'utilisateur connecté
        $authUser = $request->user();

        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }

        // Décodez le slug du lien
        $nomDecode = urldecode(str_replace('-', ' ', $nomComplet));

        // Rechercher l'utilisateur
        $user = Utilisateur::where('nomComplet', $nomDecode)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Protection: Empêche la vue de données d'une autre personne
        if ((int) $authUser->id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé'
            ], 403);
        }

        return response()->json([
            'success' => true,

            'user' => [
                'id' => $user->id,
                'nomComplet' => $user->nomComplet,
                'email' => $user->email,
                'role' => $user->role,
                'photoUrl' => $user->photoUrl,
            ],

            'evenements' => [
                'data' => [],
                'total' => 0
            ]
        ]);

    } catch (\Exception $e) {

        \Log::error('Erreur evenements client: '.$e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du chargement des événements'
        ], 500);
    }
}
    /**
     * Messages du client
     */
    public function messages(Request $request, $nomComplet)
    {
        try {
            $nomDecode = urldecode(str_replace('-', ' ', $nomComplet));
            $user = Utilisateur::where('nomComplet', 'like', $nomDecode)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'user' => $user,
                'messages' => [
                    'data' => [],
                    'total' => 0
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur messages client: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des messages'
            ], 500);
        }
    }

    /**
     * Changement de mot de passe
     */
   public function changePassword(Request $request, $nomComplet)
    {
        try {
            Log::info('=== TENTATIVE CHANGEMENT PASSWORD ===');
            Log::info('Nom complet reçu: ' . $nomComplet);

            // Décoder le nom (pour les espaces et caractères spéciaux)
            $nomDecode = urldecode($nomComplet);

            // Récupérer l'utilisateur authentifié
            $user = Auth::user();

            // Vérifier que l'utilisateur est connecté
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez être connecté'
                ], 401);
            }

            // Vérifier que le nom correspond à l'utilisateur connecté
            if ($user->nomComplet !== $nomDecode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Action non autorisée'
                ], 403);
            }

            // Validation des données
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Vérifier l'ancien mot de passe
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mot de passe actuel incorrect'
                ], 400);
            }

            // Mettre à jour le mot de passe
            $user->password = Hash::make($request->new_password);
            $user->save();

            Log::info('✅ Mot de passe changé avec succès', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mot de passe changé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur changement password: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de mot de passe'
            ], 500);
        }
    }

    /**
     * Upload photo de profil
     */
    public function uploadPhoto(Request $request, $nomComplet)
    {
        try {
            $nomDecode = urldecode(str_replace('-', ' ', $nomComplet));
            $user = Utilisateur::where('nomComplet', 'like', $nomDecode)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            if (Auth::id() !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé'
                ], 403);
            }

            $request->validate([
                      'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

            if ($request->hasFile('avatar')) {
                // Supprimer l'ancienne photo
                if ($user->avatar ) {
                    $oldPath = str_replace('/storage/', '', parse_url($user->photoUrl, PHP_URL_PATH));
                    Storage::disk('public')->delete($oldPath);
                }

                $path = $request->file('avatar')->store('profiles', 'public');
                $user->photoUrl = asset('storage/' . $path);
                $user->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Photo mise à jour',
                'photoUrl' => $user->photoUrl
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur upload photo: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de la photo'
            ], 500);
        }
    }
   public function getClientCount(){
        $count=Utilisateur::where('role', 'client')->count();
        return response()->json([
            'success' => true,
            'client_count' => $count
        ]);
    }
      public function getclientsPerMonth()
{
    $data = DB::table('utilisateurs')
        ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as mois"), DB::raw("COUNT(*) as client_count"))
        ->where('role', 'client')
        ->groupBy('mois')
        ->orderBy('mois')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $data
    ]);
}
public function getClient(){
    $clients=Utilisateur::where('role', 'client')->get();
    return response()->json([
        'success' => true,
        'clients' => $clients
    ]);

}
public function getClientByemail($email){
    $client=Utilisateur::where('role', 'client')->where('email', $email)->first();
    if(!$client){
        return response()->json([
            'success' => false,
            'message' => 'Client non trouvé avec l\'email: ' . $email
        ], 404);
    }
    return response()->json([
        'success' => true,
        'client' => $client
    ]);
}


public function updateAvatarClient(Request $request, $id)
{
    $currentUser = Auth::user();

    // Vérifier authentification
    if (!$currentUser) {
        return response()->json([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    }

    // Trouver utilisateur
    $user = Utilisateur::find($id);

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Utilisateur introuvable'
        ], 404);
    }

    // Vérifier permission
    if (
        strtolower($currentUser->role) !== 'admin' &&
        $currentUser->id !== $user->id
    ) {
        return response()->json([
            'success' => false,
            'message' => 'Accès refusé'
        ], 403);
    }

    // Validation image
    $request->validate([
        'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5048'
    ]);

    // Supprimer ancienne image
    if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
        Storage::disk('public')->delete($user->avatar);
    }

    // Déterminer dossier
    $folder = strtolower($user->role) === 'admin'
        ? 'avatars/admins'
        : 'avatars/clients';

    // Nouveau nom unique
    $file = $request->file('avatar');
    $extension = $file->getClientOriginalExtension();
    $filename = time() . '_' . Str::random(10) . '.' . $extension;

    // Resize + compression
   $manager = new ImageManager(new Driver());

$image = $manager->read($file)
    ->cover(300, 300)
    ->save(storage_path('app/public/' . $folder . '/' . $filename));

    $path = $folder . '/' . $filename;

    // Mise à jour DB
    $user->avatar = $path;
    $user->photoUrl = asset('storage/' . $path);
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Avatar mis à jour avec succès',
        'avatar_url' => $user->photoUrl
    ]);
}
}
