<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ParticipantController extends Controller
{
    /**
     * Inscription à un événement
     */
    public function register(Request $request, $evenementId)
    {
        try {
            $user = $request->user();

            $evenement = Evenement::find($evenementId);

            if (!$evenement) {
                return response()->json([
                    'success' => false,
                    'message' => 'Événement introuvable'
                ], 404);
            }

            // Vérifier que l'événement n'est pas passé
            if (Carbon::parse($evenement->date)->endOfDay()->isPast()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas vous inscrire à un événement terminé'
                ], 400);
            }

            // Vérifier la capacité
            $nbParticipants = Participant::where('evenement_id', $evenementId)
                ->where('statut', '!=', 'annulé')
                ->count();

            if ($nbParticipants >= $evenement->capaciteMax) {
                return response()->json([
                    'success' => false,
                    'message' => 'L\'événement affiche complet'
                ], 400);
            }

            // Vérifier l'absence d'inscription préalable
            $existing = Participant::where('utilisateur_id', $user->id)
                ->where('evenement_id', $evenementId)
                ->first();

            if ($existing) {
                // Si déjà annulé, permettre la réinscription
                if ($existing->statut === 'annulé') {
                    $existing->update([
                        'statut' => $evenement->prix > 0 ? 'en_attente' : 'confirmé',
                        'dateInscription' => now()
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Réinscription réussie !',
                        'participant' => $existing
                    ], 200);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Vous êtes déjà inscrit(e) à cet événement'
                ], 400);
            }

            // Déterminer le statut initial
            $statut = $evenement->prix > 0 ? 'en_attente' : 'confirmé';

            // Créer l'inscription
            $participant = Participant::create([
                'utilisateur_id' => $user->id,
                'evenement_id' => $evenementId,
                'dateInscription' => now(),
                'statut' => $statut
            ]);

            Log::info('✅ Inscription réussie', [
                'user_id' => $user->id,
                'evenement_id' => $evenementId,
                'statut' => $statut
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Inscription réussie !',
                'participant' => $participant->load('evenement:id,titre,date,lieu')
            ], 201);

        } catch (\Exception $e) {
            Log::error('❌ Erreur inscription: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'inscription'
            ], 500);
        }
    }

    /**
     * Annuler une participation
     */
    public function cancel(Request $request, $evenementId)
    {
        try {
            $user = $request->user();

            $participant = Participant::where('utilisateur_id', $user->id)
                ->where('evenement_id', $evenementId)
                ->first();

            if (!$participant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas inscrit à cet événement'
                ], 404);
            }

            // Vérifier si déjà annulé
            if ($participant->statut === 'annulé') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette participation est déjà annulée'
                ], 400);
            }

            $participant->update(['statut' => 'annulé']);

            Log::info('❌ Participation annulée', [
                'user_id' => $user->id,
                'evenement_id' => $evenementId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Participation annulée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur annulation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation'
            ], 500);
        }
    }

    /**
     * Mes participations
     */
    public function myParticipations(Request $request)
    {
        try {
            $user = $request->user();

            $participations = Participant::with(['evenement' => function($q) {
                    $q->select('id', 'titre', 'date', 'lieu', 'typePrix', 'imageUrl', 'capaciteMax');
                }])
                ->where('utilisateur_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 10));

            // Ajouter des informations utiles
            $participations->getCollection()->transform(function ($participation) {
                if ($participation->evenement) {
                    $participation->evenement->est_passe = $participation->evenement->date < now();
                }
                return $participation;
            });

            return response()->json([
                'success' => true,
                'data' => $participations,
                'total' => $participations->total()
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur participations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des participations'
            ], 500);
        }
    }

    /**
     * Liste des participants d'un événement (Admin/Créateur)
     */
    public function eventParticipants(Request $request, $evenementId)
    {
        try {
            $user = $request->user();

            $evenement = Evenement::find($evenementId);

            if (!$evenement) {
                return response()->json([
                    'success' => false,
                    'message' => 'Événement introuvable'
                ], 404);
            }

            // Vérifier les permissions (admin ou créateur)
            $isCreator = $evenement->createdBy_id === $user->id;
            $isAdmin = in_array(strtolower($user->role), ['admin', 'Admin', 'ADMIN']);

            if (!$isCreator && !$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à voir la liste des participants'
                ], 403);
            }

            // Filtres optionnels
            $query = Participant::with('utilisateur:id,nomComplet,email,telephone,entrepriseNom,avatar')
                ->where('evenement_id', $evenementId);

            // Filtre par statut
            if ($request->has('statut')) {
                $query->where('statut', $request->statut);
            }

            // Recherche par nom
            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('utilisateur', function($q) use ($search) {
                    $q->where('nomComplet', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $participants = $query->orderBy('dateInscription', 'desc')
                ->paginate($request->get('per_page', 20));

            // Statistiques des participants
            $stats = [
                'total' => Participant::where('evenement_id', $evenementId)->count(),
                'confirmes' => Participant::where('evenement_id', $evenementId)->where('statut', 'confirmé')->count(),
                'en_attente' => Participant::where('evenement_id', $evenementId)->where('statut', 'en_attente')->count(),
                'annules' => Participant::where('evenement_id', $evenementId)->where('statut', 'annulé')->count(),
                'capacite_max' => $evenement->capaciteMax,
                'places_restantes' => $evenement->capaciteMax - Participant::where('evenement_id', $evenementId)->where('statut', '!=', 'annulé')->count()
            ];

            return response()->json([
                'success' => true,
                'evenement' => [
                    'id' => $evenement->id,
                    'titre' => $evenement->titre,
                    'date' => $evenement->date,
                    'lieu' => $evenement->lieu
                ],
                'stats' => $stats,
                'data' => $participants,
                'total' => $participants->total()
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur liste participants: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des participants'
            ], 500);
        }
    }

    /**
     * Mettre à jour le statut d'un participant (Admin/Créateur)
     */
    public function updateStatus(Request $request, $participantId)
    {
        try {
            $user = $request->user();

            // Validation
            $validator = Validator::make($request->all(), [
                'statut' => 'required|string|in:en_attente,confirmé,annulé'
            ], [
                'statut.required' => 'Le statut est requis',
                'statut.in' => 'Statut invalide (en_attente, confirmé, annulé)'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Trouver le participant avec l'événement
            $participant = Participant::with('evenement')->find($participantId);

            if (!$participant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Participant introuvable'
                ], 404);
            }

            // Vérifier les permissions
            $isCreator = $participant->evenement->createdBy_id === $user->id;
            $isAdmin = in_array(strtolower($user->role), ['admin', 'Admin', 'ADMIN']);

            if (!$isCreator && !$isAdmin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à modifier ce participant'
                ], 403);
            }

            // Vérifier la capacité si on confirme
            if ($request->statut === 'confirmé' && $participant->statut !== 'confirmé') {
                $nbConfirmes = Participant::where('evenement_id', $participant->evenement_id)
                    ->where('statut', 'confirmé')
                    ->count();

                if ($nbConfirmes >= $participant->evenement->capaciteMax) {
                    return response()->json([
                        'success' => false,
                        'message' => 'L\'événement est complet, impossible de confirmer'
                    ], 400);
                }
            }

            // Mettre à jour le statut
            $participant->update([
                'statut' => $request->statut
            ]);

            Log::info('✅ Statut participant mis à jour', [
                'participant_id' => $participantId,
                'nouveau_statut' => $request->statut,
                'modifie_par' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'participant' => $participant->fresh()->load('utilisateur:id,nomComplet,email')
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur mise à jour statut: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut'
            ], 500);
        }
    }

    /**
     * Compter les participants d'un événement
     */
    public function CountParticipants($id)
    {
        try {
            $evenement = Evenement::find($id);

            if (!$evenement) {
                return response()->json([
                    'success' => false,
                    'message' => 'Événement introuvable'
                ], 404);
            }

            $stats = [
                'total' => Participant::where('evenement_id', $id)->count(),
                'confirmes' => Participant::where('evenement_id', $id)->where('statut', 'confirmé')->count(),
                'en_attente' => Participant::where('evenement_id', $id)->where('statut', 'en_attente')->count(),
                'annules' => Participant::where('evenement_id', $id)->where('statut', 'annulé')->count(),
                'capacite_max' => $evenement->capaciteMax,
                'places_restantes' => $evenement->capaciteMax - Participant::where('evenement_id', $id)
                    ->where('statut', '!=', 'annulé')
                    ->count()
            ];

            return response()->json([
                'success' => true,
                'evenement_id' => (int)$id,
                'stats' => $stats,
                'message' => "Total participants: {$stats['total']}, Places restantes: {$stats['places_restantes']}"
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur comptage participants: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du comptage'
            ], 500);
        }
    }

    /**
     * Supprimer un participant (Admin uniquement)
     */
    public function destroy(Request $request, $participantId)
    {
        try {
            $user = $request->user();

            // Vérifier que l'utilisateur est admin
            if (!in_array(strtolower($user->role), ['admin', 'Admin', 'ADMIN'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seul un administrateur peut supprimer un participant'
                ], 403);
            }

            $participant = Participant::find($participantId);

            if (!$participant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Participant introuvable'
                ], 404);
            }

            $participant->delete();

            Log::info('🗑️ Participant supprimé', [
                'participant_id' => $participantId,
                'supprime_par' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Participant supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erreur suppression participant: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }
}
