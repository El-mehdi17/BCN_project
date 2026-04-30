<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileIsCompleted
{
    public function handle(Request $request, Closure $next): Response
    {
       
        if ($request->user() && !$request->user()->profileComplited) {


            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Profile incomplete',
                    'redirect' => '/complete-profile'
                ], 403);
            }

            // إذا كان طلب ويب عادي
            return redirect('/complete-profile');
        }

        return $next($request);
    }
}
