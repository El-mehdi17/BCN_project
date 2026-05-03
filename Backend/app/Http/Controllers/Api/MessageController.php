<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function conversations($nomComplet)
    {
        $user = $this->getUser($nomComplet);
        
        // Récupérer tous les utilisateurs avec qui l'utilisateur a échangé
        $sentTo = Message::where('expediteur_id', $user->id)
            ->select('destinataire_id')
            ->distinct()
            ->pluck('destinataire_id');
        
        $receivedFrom = Message::where('destinataire_id', $user->id)
            ->select('expediteur_id')
            ->distinct()
            ->pluck('expediteur_id');
        
        $userIds = $sentTo->merge($receivedFrom)->unique();
        
        $conversations = Utilisateur::whereIn('id', $userIds)
            ->get()
            ->map(function($otherUser) use ($user) {
                $lastMessage = Message::where(function($q) use ($user, $otherUser) {
                    $q->where('expediteur_id', $user->id)
                      ->where('destinataire_id', $otherUser->id);
                })->orWhere(function($q) use ($user, $otherUser) {
                    $q->where('expediteur_id', $otherUser->id)
                      ->where('destinataire_id', $user->id);
                })->latest()->first();
                
                $unreadCount = Message::where('expediteur_id', $otherUser->id)
                    ->where('destinataire_id', $user->id)
                    ->where('lu', false)
                    ->count();
                
                return [
                    'user' => $otherUser,
                    'lastMessage' => $lastMessage,
                    'unreadCount' => $unreadCount,
                    'updatedAt' => $lastMessage ? $lastMessage->dateEnvoi : now()
                ];
            })
            ->sortByDesc('updatedAt')
            ->values();
        
        return response()->json($conversations);
    }
    
    public function messages($nomComplet, $userId, Request $request)
    {
        $user = $this->getUser($nomComplet);
        
        $messages = Message::where(function($q) use ($user, $userId) {
                $q->where('expediteur_id', $user->id)
                  ->where('destinataire_id', $userId);
            })
            ->orWhere(function($q) use ($user, $userId) {
                $q->where('expediteur_id', $userId)
                  ->where('destinataire_id', $user->id);
            })
            ->orderBy('dateEnvoi', 'desc')
            ->paginate(20);
        
        return response()->json($messages);
    }
    
    public function markAsRead($nomComplet, $userId)
    {
        $user = $this->getUser($nomComplet);
        
        Message::where('expediteur_id', $userId)
            ->where('destinataire_id', $user->id)
            ->where('lu', false)
            ->update([
                'lu' => true,
                'luLe' => now()
            ]);
        
        return response()->json(['message' => 'Messages marqués comme lus']);
    }
    
    public function stats($nomComplet)
    {
        $user = $this->getUser($nomComplet);
        
        $total = Message::where('destinataire_id', $user->id)
            ->orWhere('expediteur_id', $user->id)
            ->count();
        
        $unread = Message::where('destinataire_id', $user->id)
            ->where('lu', false)
            ->count();
        
        $sent = Message::where('expediteur_id', $user->id)->count();
        
        return response()->json([
            'total' => $total,
            'unread' => $unread,
            'sent' => $sent
        ]);
    }
    
    public function send($nomComplet, Request $request)
    {
        $user = $this->getUser($nomComplet);
        
        $request->validate([
            'destinataire_id' => 'required|exists:utilisateur,id',
            'contenu' => 'required|string'
        ]);
        
        $message = Message::create([
            'expediteur_id' => $user->id,
            'destinataire_id' => $request->destinataire_id,
            'contenu' => $request->contenu,
            'dateEnvoi' => now(),
            'lu' => false
        ]);
        
        return response()->json($message, 201);
    }
    
    public function delete($nomComplet, $id)
    {
        $user = $this->getUser($nomComplet);
        
        $message = Message::where('id', $id)
            ->where('expediteur_id', $user->id)
            ->firstOrFail();
        
        $message->delete();
        
        return response()->json(['message' => 'Message supprimé']);
    }
    
    public function searchUsers($nomComplet, Request $request)
    {
        $user = $this->getUser($nomComplet);
        $search = $request->get('search', '');
        
        $users = Utilisateur::where('id', '!=', $user->id)
            ->where(function($q) use ($search) {
                $q->where('nomComplet', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->limit(20)
            ->get();
        
        // Si l'utilisateur est client, il ne peut voir que les admins
        if ($user->role !== 'admin' && $user->role !== 'Admin') {
            $users = $users->filter(function($u) {
                return $u->role === 'admin' || $u->role === 'Admin';
            });
        }
        
        return response()->json($users->values());
    }
    
    private function getUser($nomComplet)
    {
        $nomComplet = str_replace('-', ' ', urldecode($nomComplet));
        $user = Utilisateur::where('nomComplet', 'LIKE', '%' . $nomComplet . '%')->firstOrFail();
        
        if (Auth::id() !== $user->id) {
            abort(403, 'Non autorisé');
        }
        
        return $user;
    }
}