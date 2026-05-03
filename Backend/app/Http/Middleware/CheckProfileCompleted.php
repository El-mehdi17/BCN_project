<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckProfileCompleted
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if ($user && !$user->profileCompleted) {
            return response()->json([
                'message' => "Veuillez d'abord compléter votre profil.",
                'profile_completed' => false
            ], 403);
        }
        
        return $next($request);
    }
}