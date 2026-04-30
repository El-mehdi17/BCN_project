<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class GoogleController extends Controller
{
   /**

* Rediriger l'utilisateur vers la page Google

*/
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

  /**

* Traitement des données provenant de Google

*/
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // Rechercher ou créer un utilisateur
            $user = User::updateOrCreate(
                ['google_id' => $googleUser->id],
                [
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'avatar' => $googleUser->avatar,
                    // Rechercher ou créer un utilisateur
                    'password' => $user->password ?? null, 
                ]
            );

            Auth::login($user);

           // Vérifier si l'utilisateur a complété ses données (ville, position, etc.)
            if (!$user->profileComplited) {
                return redirect()->route('profile.complete');
            }

            return redirect()->intended('/dashboard');

        } catch (Exception $e) {
            return redirect('/login')->with('error',"Une erreur s'est produite lors de la connexion via Google.");
        }
    }
}