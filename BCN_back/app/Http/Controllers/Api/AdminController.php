<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use App\Models\Evenement;
use App\Models\Participant;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    /**
     *
     * POST /api/admin/admins
     */
    public function registerAdmin(Request $request)
{
    \Log::info('=== TENTATIVE CREATION ADMIN ===');
    \Log::info('Données reçues:', $request->except(['password', 'password_confirmation']));
    \Log::info('Utilisateur connecté:', ['id' => Auth::id(), 'email' => Auth::user()->email ?? 'non connecté']);


    $currentUser = Auth::user();
    if (!$currentUser) {
        \Log::error('❌ Aucun utilisateur connecté');
        return response()->json([
            'success' => false,
            'message' => 'Vous devez être connecté'
        ], 401);
    }

    if (!in_array(strtolower($currentUser->role), ['admin', 'administrateur'])) {
        \Log::error('❌ Utilisateur non admin:', ['role' => $currentUser->role]);
        return response()->json([
            'success' => false,
            'message' => 'Accès non autorisé. Réservé aux administrateurs.'
        ], 403);
    }


    $validator = Validator::make($request->all(), [
        'nomComplet' => 'required|string|max:255',
        'email' => 'required|email|unique:utilisateurs,email',
        'password' => 'required|string|min:8|confirmed',
        'poste' => 'nullable|string|max:255',
        'ville' => 'nullable|string|max:255',
        'entrepriseNom' => 'nullable|string|max:255',
        'photoUrl' => 'nullable|string',
        'role' => 'nullable|string'
    ]);

    if ($validator->fails()) {
        \Log::error('❌ Validation échouée:', $validator->errors()->toArray());
        return response()->json([
            'success' => false,
            'message' => 'Erreur de validation',
            'errors' => $validator->errors()
        ], 422);
    }

    try {

        $admin = new Utilisateur();
        $admin->nomComplet = $request->nomComplet;
        $admin->email = $request->email;
        $admin->password = Hash::make($request->password);
        $admin->poste = $request->poste ?? 'Administrateur';
        $admin->ville = $request->ville;
        $admin->entrepriseNom = $request->entrepriseNom ?? 'BCN';
        $admin->photoUrl = $request->photoUrl;
        $admin->role = $request->role ?? 'admin';
        $admin->profileCompleted = true;
        $admin->dateInscription = now();

        $admin->save();

        \Log::info('✅ Administrateur créé avec succès:', [
            'id' => $admin->id,
            'email' => $admin->email,
            'nom' => $admin->nomComplet
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Administrateur créé avec succès',
            'admin' => [
                'id' => $admin->id,
                'nomComplet' => $admin->nomComplet,
                'email' => $admin->email,
                'role' => $admin->role,
            ]
        ], 201);

    } catch (\Exception $e) {
        \Log::error('❌ Exception création admin: ' . $e->getMessage());
        \Log::error('Trace: ' . $e->getTraceAsString());

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création: ' . $e->getMessage()
        ], 500);
    }
}


    public function listAdmins(Request $request)
    {
        // التحقق من الصلاحية
        $currentUser = Auth::user();
        if (!$currentUser || !in_array(strtolower($currentUser->role), ['admin', 'administrateur'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        // جلب جميع المشرفين
        $admins = Utilisateur::whereIn('role', ['admin', 'Admin', 'moderator'])
            ->orderBy('dateInscription', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'admins' => $admins,
            'total' => $admins->count()
        ]);
    }

    /**
     * ✅ حذف مشرف
     * DELETE /api/admin/admins/{id}
     */
    public function deleteAdmin($id)
    {
        $currentUser = Auth::user();

        // لا يمكن حذف النفس
        if ($currentUser->id == $id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas supprimer votre propre compte'
            ], 400);
        }

        $admin = Utilisateur::whereIn('role', ['admin', 'Admin', 'moderator'])
            ->find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Administrateur non trouvé'
            ], 404);
        }


        if ($admin->photoUrl && strpos($admin->photoUrl, '/storage/') !== false) {
            $path = str_replace('/storage/', '', parse_url($admin->photoUrl, PHP_URL_PATH));
            Storage::disk('public')->delete($path);
        }

        $admin->delete();

        \Log::info('🗑️ Administrateur supprimé', [
            'id' => $id,
            'supprimé_par' => $currentUser->email
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Administrateur supprimé avec succès'
        ]);
    }

    /**
     * ✅ Afficher les détails d'un administrateur
     * GET /api/admin/admins/{id}
     */
    public function showAdmin($id)
    {
        $admin = Utilisateur::whereIn('role', ['admin', 'Admin', 'moderator'])
            ->find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Administrateur non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'admin' => $admin
        ]);
    }

    /**
     * ✅ mise à jour des données d'un administrateur
     * PUT /api/admin/admins/{id}
     */
    public function updateAdmin(Request $request, $id)
    {
        $currentUser = Auth::user();

        $admin = Utilisateur::whereIn('role', ['admin', 'Admin', 'moderator'])
            ->find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Administrateur non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nomComplet' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:utilisateurs,email,' . $id,
            "telephone" => "nullable|string|max:20",
            'poste' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'entrepriseNom' => 'nullable|string|max:255',
            'role' => 'nullable|string|in:admin,Admin,moderator',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ] ,[
            'avatar.image' => 'Le fichier doit être une image',
            'avatar.mimes' => 'Format accepté : JPG, PNG, GIF, WebP',
            'avatar.max' => 'L\'image ne doit pas dépasser 2Mo'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
         $data = $validator->validated();
         $data['avatar'] = $request->file('avatar')->store('avatars/admins', 'public');// Conserver l'ancien avatar par défaut

        $admin->update($request->only([
            'nomComplet', 'email', "telephone",'poste', 'ville', 'entrepriseNom', 'role', $data['avatar']
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Administrateur mis à jour',
            'admin' => $admin
        ]);
    }

    /**
     * ✅ Upload d'une image pour un administrateur
     * POST /api/admin/upload-image
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048'
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('admins', 'public');
            $url = asset('storage/' . $path);

            return response()->json([
                'success' => true,
                'url' => $url
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Aucune image fournie'
        ], 400);
    }

    /**
     *
     * GET /api/admin/stats
     */
 public function stats()
{
    try {
        $totalClients = Utilisateur::where('role', 'utilisateur')->count();
        $totalAdmins = Utilisateur::whereIn('role', ['admin', 'Admin', 'moderator'])->count();
        $totalEvenements = Evenement::count();
        $totalParticipants = Participant::count();
        $inscriptionsEnAttente = Participant::where('statut', 'en_attente')->count();
        $messagesNonLus = Message::where('lu', false)->count();

        // Calcul du revenu total
        $revenuTotal = Participant::where('statut', 'confirmé')
            ->join('evenements', 'participants.evenement_id', '=', 'evenements.id')
            ->sum('evenements.prix');

        return response()->json([
            'success' => true,
            'stats' => [
                'total_clients' => $totalClients,
                'total_admins' => $totalAdmins,
                'total_evenements' => $totalEvenements,
                'total_participants' => $totalParticipants,
                'inscriptions_en_attente' => $inscriptionsEnAttente,
                'messages_non_lus' => $messagesNonLus,
                'revenu_total' => number_format($revenuTotal, 2, '.', ' '),
                'taux_Participant' => $totalEvenements > 0
                    ? round(($totalParticipants / $totalEvenements) * 100)
                    : 0,
            ]
        ]);
    } catch (\Exception $e) {
        \Log::error('Erreur stats: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du chargement des statistiques'
        ], 500);
    }
}
public function dashboardStats()
    {
        try {
            $currentUser = Auth::user();

            if (!$currentUser || !in_array(strtolower($currentUser->role), ['admin', 'administrateur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Statistiques des 30 derniers jours
            $date30Jours = now()->subDays(30);

            $nouveauxClients = Utilisateur::where('role', 'utilisateur')
                ->where('dateInscription', '>=', $date30Jours)
                ->count();

            $nouveauxEvenements = Evenement::where('created_at', '>=', $date30Jours)
                ->count();

            $nouvellesParticipants = Participant::where('created_at', '>=', $date30Jours)
                ->count();

            // Top 5 des événements les plus populaires
            $topEvenements = Evenement::withCount('participants')
                ->orderBy('participants_count', 'desc')
                ->limit(5)
                ->get()
                ->map(fn($event) => [
                    'id' => $event->id,
                    'titre' => $event->titre,
                    'participants_count' => $event->participants_count,
                    'date' => $event->date
                ]);

            return response()->json([
                'success' => true,
                'stats' => [
                    'nouveaux_clients_30j' => $nouveauxClients,
                    'nouveaux_evenements_30j' => $nouveauxEvenements,
                    'nouvelles_participants_30j' => $nouvellesParticipants,
                    'top_evenements' => $topEvenements,
                    'date_range' => [
                        'from' => $date30Jours->format('Y-m-d'),
                        'to' => now()->format('Y-m-d')
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur dashboard stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques du dashboard'
            ], 500);
        }
    }
    public function changeAdminPassword(Request $request, $id)
    {
        $currentUser = Auth::user();

        if (!$currentUser || !in_array(strtolower($currentUser->role), ['admin', 'Admin', 'moderator'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $admin = Utilisateur::whereIn('role', ['admin', 'Admin', 'moderator'])
            ->find($id);

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Administrateur non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $admin->password = Hash::make($request->password);
        $admin->save();

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe mis à jour avec succès'
        ]);
    }
    public function updateAvatar(Request $request, $id)
{
    $currentUser = Auth::user();

    if (!$currentUser) {
        return response()->json([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    }

    $user = Utilisateur::find($id);

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Utilisateur introuvable'
        ], 404);
    }


    if (
        strtolower($currentUser->role) !== 'admin' &&
        $currentUser->id !== $user->id
    ) {
        return response()->json([
            'success' => false,
            'message' => 'Accès refusé'
        ], 403);
    }

    $request->validate([
        'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
    ]);

    if ($user->avatar) {
        Storage::disk('public')->delete($user->avatar);
    }

    $folder = strtolower($user->role) === 'admin'
        ? 'avatars/admins'
        : 'avatars/clients';

    $path = $request->file('avatar')->store($folder, 'public');

    $user->avatar = $path;
    $user->photoUrl = asset('storage/' . $path);
    $user->save();

    return response()->json([
        'success' => true,
        'avatar_url' => $user->photoUrl

    ]);
}

}
