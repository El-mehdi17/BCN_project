<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class EvenementController extends Controller
{
    /**
     * Liste de tous les événements (Admin)
     */
    public function index(Request $request)
    {
        try {
            $query = Evenement::query();

            // Recherche
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('titre', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('lieu', 'like', "%{$search}%");
                });
            }

            // Filtre par date
            if ($request->has('date') && !empty($request->date)) {
                $query->whereDate('date', $request->date);
            }

            // Filtre par lieu
            if ($request->has('lieu') && !empty($request->lieu)) {
                $query->where('lieu', 'like', "%{$request->lieu}%");
            }

            // Filtre par type de prix
            if ($request->has('typePrix') && !empty($request->typePrix)) {
                $query->where('typePrix', $request->typePrix);
            }

            // Filtre par statut (futur/passé)
            if ($request->has('statut')) {
                if ($request->statut === 'avenir') {
                    $query->whereDate('date', '>=', now());
                } elseif ($request->statut === 'passe') {
                    $query->whereDate('date', '<', now());
                }
            }

            // Tri
            $orderBy = $request->get('order_by', 'date');
            $orderDirection = $request->get('order_direction', 'asc');
            $query->orderBy($orderBy, $orderDirection);

            // Pagination
            $perPage = $request->get('per_page', 12);
            $evenements = $query->withCount('participants')->paginate($perPage);

            // Ajouter des informations supplémentaires
            $evenements->getCollection()->transform(function ($evenement) {
                $evenement->places_restantes = $evenement->capaciteMax - $evenement->participants_count;
                $evenement->est_complet = $evenement->places_restantes <= 0;
                return $evenement;
            });

            return response()->json([
                'success' => true,
                'data' => $evenements,
                'total' => $evenements->total()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur liste événements: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des événements'
            ], 500);
        }
    }

    /**
     * Détails d'un événement
     */
    public function show($id)
    {
        try {
            $evenement = Evenement::with(['createur:id,nomComplet,email,avatar'])
                ->withCount('participants')
                ->findOrFail($id);

            // Vérifier si l'utilisateur connecté participe
            $user = Auth::user();
            $participation = null;

            if ($user) {
                $participation = Participant::where('utilisateur_id', $user->id)
                    ->where('evenement_id', $id)
                    ->first();
            }

            $evenement->estInscrit = !is_null($participation);
            $evenement->statutParticipation = $participation->statut ?? null;
            $evenement->places_restantes = $evenement->capaciteMax - $evenement->participants_count;
            $evenement->est_complet = $evenement->places_restantes <= 0;

            return response()->json([
                'success' => true,
                'data' => $evenement
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur détail événement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Événement non trouvé'
            ], 404);
        }
    }

    /**
     * Créer un nouvel événement (Admin)
     */
    public function store(Request $request)
    {
        Log::info('📤 Création événement - Données reçues:', $request->except(['imageUrl', 'image']));

        try {
            // Validation
            $validator = Validator::make($request->all(), [
                'titre' => 'required|string|max:255',
                'description' => 'nullable|string',
                'lieu' => 'nullable|string|max:255',
                'date' => 'required|date',
                'prix' => 'nullable|numeric|min:0',
                'typePrix' => 'nullable|string|in:gratuit,payant',
                'capaciteMax' => 'nullable|integer|min:1',
                'imageUrl' => 'nullable|string|max:255', // ✅ Accepte les fichiers image
            ], [
                'titre.required' => 'Le titre est requis',
                'date.required' => 'La date est requise',
                'date.date_format' => 'La date doit être au format YYYY/MM/DD',
                'imageUrl.image' => 'Le fichier doit être une image',
                'imageUrl.max' => 'L\'image ne doit pas dépasser 5 Mo',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $imagePath = null;

            // ✅ Gestion de l'image (fichier uploadé)
            if ($request->hasFile('imageUrl')) {
                $file = $request->file('imageUrl');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('evenements', $filename, 'public');
                $imagePath = $path; // Stocker le chemin relatif

                Log::info('✅ Image uploadée:', ['path' => $path]);
            }

            // Déterminer le type de prix automatiquement
            $typePrix = $request->typePrix;
            if (!$typePrix) {
                $typePrix = ($request->prix > 0) ? 'payant' : 'gratuit';
            }

            // Créer l'événement
            $evenement = Evenement::create([
                'titre' => $request->titre,
                'description' => $request->description,
                'lieu' => $request->lieu ?? 'À confirmer',
                'date' => $request->date,
                'prix' => $request->prix ?? 0,
                'typePrix' => $typePrix,
                'capaciteMax' => $request->capaciteMax ?? 50,
                'imageUrl' => $imagePath ?: (is_string($request->imageUrl) ? $request->imageUrl : null),// ✅ Chemin relatif
                'createdBy_id' => Auth::id(),
            ]);

            // Ajouter l'URL complète pour la réponse
            $evenement->image_url_complete = $imagePath ? asset('storage/' . $imagePath) : null;

            Log::info('✅ Événement créé avec succès', ['id' => $evenement->id]);

            return response()->json([
                'success' => true,
                'message' => 'Événement créé avec succès',
                'data' => $evenement
            ], 201);

        } catch (\Exception $e) {
            Log::error('❌ Erreur création événement: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un événement
     */
    public function update(Request $request, $id)
    {
        Log::info('📝 Mise à jour événement ID: ' . $id);

        try {
            $evenement = Evenement::findOrFail($id);

            // Vérifier les permissions (admin ou créateur)
            $currentUser = Auth::user();
            $isCreator = $evenement->createdBy_id === $currentUser->id;
            $isAdmin = in_array(strtolower($currentUser->role), ['admin', 'Admin', 'ADMIN']);

            if (!$isCreator && !$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à modifier cet événement'
                ], 403);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'titre' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'lieu' => 'nullable|string|max:255',
                'date' => 'sometimes|date',
                'prix' => 'nullable|numeric|min:0',
                'typePrix' => 'nullable|string|in:gratuit,payant',
                'capaciteMax' => 'nullable|integer|min:1',
                'imageUrl' => 'nullable|string|max:255', // ✅ Pour nouvelle image
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only([
                'titre', 'description', 'lieu', 'date',
                'prix', 'typePrix', 'capaciteMax'
            ]);

            // ✅ Gestion de la nouvelle image
            if ($request->hasFile('imageUrl')) {
                // Supprimer l'ancienne image
                if ($evenement->imageUrl) {
                    Storage::disk('public')->delete($evenement->imageUrl);
                }

                // Stocker la nouvelle image
                $file = $request->file('imageUrl');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $data['imageUrl'] = $file->storeAs('evenements', $filename, 'public');

                Log::info('✅ Nouvelle image uploadée');
            }

            $evenement->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Événement mis à jour avec succès',
                'data' => $evenement->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur mise à jour événement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour'
            ], 500);
        }
    }

    /**
     * Supprimer un événement
     */
    public function destroy($id)
    {
        try {
            $evenement = Evenement::findOrFail($id);

            // Vérifier les permissions
            $currentUser = Auth::user();
            $isCreator = $evenement->createdBy_id === $currentUser->id;
            $isAdmin = in_array(strtolower($currentUser->role), ['admin', 'Admin', 'ADMIN']);

            if (!$isCreator && !$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé à supprimer cet événement'
                ], 403);
            }

            // Supprimer l'image associée
            if ($evenement->imageUrl) {
                Storage::disk('public')->delete($evenement->imageUrl);
            }

            // Supprimer les participations associées
            Participant::where('evenement_id', $id)->delete();

            // Supprimer l'événement
            $evenement->delete();

            Log::info('🗑️ Événement supprimé', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Événement supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur suppression événement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    /**
     * Upload d'image pour événement
     */
    public function uploadImage(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'image' => 'nullable|string|max:255',
            ], [
                'image.required' => 'L\'image est requise',
                'image.image' => 'Le fichier doit être une image',
                'image.max' => 'L\'image ne doit pas dépasser 5 Mo',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('evenements', $filename, 'public');

            Log::info('✅ Image uploadée', ['filename' => $filename]);

            return response()->json([
                'success' => true,
                'message' => 'Image uploadée avec succès',
                'url' => asset('storage/' . $path),
                'path' => $path,
                'filename' => $filename
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur upload image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Participer à un événement
     */
    public function uploadEventImage(Request $request)
{
    $request->validate([
        'imageUrl' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120'
    ]);

    $file = $request->file('imageUrl');

    $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();

    $path = $file->storeAs('evenements', $filename, 'public');

    return response()->json([
        'success' => true,
        'url' => $path
    ]);
}
    public function participer($id)
    {
        try {
            $user = Auth::user();
            $evenement = Evenement::findOrFail($id);

            // Vérifier la date
            if ($evenement->date < now()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet événement est déjà passé'
                ], 400);
            }

            // Vérifier la capacité
            $nbParticipants = Participant::where('evenement_id', $id)->count();
            if ($nbParticipants >= $evenement->capaciteMax) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet événement est complet'
                ], 400);
            }

            // Vérifier si déjà inscrit
            $existe = Participant::where('utilisateur_id', $user->id)
                ->where('evenement_id', $id)
                ->exists();

            if ($existe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous êtes déjà inscrit à cet événement'
                ], 400);
            }

            Participant::create([
                'utilisateur_id' => $user->id,
                'evenement_id' => $id,
                'dateInscription' => now(),
                'statut' => 'confirme'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inscription réussie !'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur participation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'inscription'
            ], 500);
        }
    }

    /**
     * Statistiques des événements (Admin)
     */
    public function statistics()
    {
        try {
            $stats = [
                'total' => Evenement::count(),
                'avenir' => Evenement::whereDate('date', '>=', now())->count(),
                'passe' => Evenement::whereDate('date', '<', now())->count(),
                'gratuit' => Evenement::where('typePrix', 'gratuit')->count(),
                'payant' => Evenement::where('typePrix', 'payant')->count(),
                'total_participants' => Participant::count(),
                'evenement_plus_populaire' => Evenement::withCount('participants')
                    ->orderBy('participants_count', 'desc')
                    ->first(),
                'evenements_par_mois' => Evenement::selectRaw('MONTH(date) as mois, COUNT(*) as total')
                    ->whereYear('date', now()->year)
                    ->groupBy('mois')
                    ->orderBy('mois')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur statistiques: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques'
            ], 500);
        }
    }

    /**
     * Liste des participants d'un événement (Admin)
     */
    public function participants($id)
    {
        try {
            $evenement = Evenement::findOrFail($id);

            $participants = Participant::where('evenement_id', $id)
                ->with('utilisateur:id,nomComplet,email,telephone')
                ->orderBy('dateInscription', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'evenement' => [
                    'id' => $evenement->id,
                    'titre' => $evenement->titre,
                    'capaciteMax' => $evenement->capaciteMax
                ],
                'data' => $participants,
                'total' => $participants->total()
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur participants: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des participants'
            ], 500);
        }
    }
  public function sommePrixEnAttente()
{
    try{
    $total = DB::table('evenements as e')
        ->join('participants as p', 'e.id', '=', 'p.evenement_id')
        ->where('p.statut', 'en_attente')

        ->sum('e.prix');

    return response()->json([
        'total_prix' => $total
    ]);
    }
    catch (\Exception $e) {
        Log::error('❌ Erreur somme prix en attente: ' . $e->getMessage());
         return response()->json([
            'success' => false,
            'message' => 'Erreur lors du calcul de la somme des prix en attente'
        ], 500);
}

}
public function clientEnregistre($id){
    try{
    $total = DB::table('participants')
    ->where('statut', 'en_attente')
    ->where('evenement_id', $id)
    ->count('utilisateur_id');

return response()->json([
    'evenement_id' => $id,
    'nb_en_attente' => $total
]);
}
catch(\Exception $e){
 Log::error('❌ Erreur nbr de client dans quel evenemets en attente: ' . $e->getMessage());
         return response()->json([
            'success' => false,
            'message' => 'Erreur lors du calcul de la somme  en attente'
        ], 500);
}

}
}
