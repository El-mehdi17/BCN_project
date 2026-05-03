<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotificationCustom extends Notification
{
    use Queueable;

    public $url;

    public function __construct($url)
    {
        $this->url = $url;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
        ->subject('🔐 Réinitialisation de votre mot de passe')

        ->greeting('Bonjour 👋')

        ->line('Vous avez demandé à réinitialiser votre mot de passe.')

        ->line('Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :')

        ->action('Réinitialiser mon mot de passe', $this->url)

        ->line('⏳ Ce lien expirera dans 60 minutes.')

        ->line('Si vous n\'êtes pas à l\'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.')

        ->salutation('— L\'équipe BCN 🚀')
        ->view('emails.reset-password', [
            'url' => $this->url
        ]);
    }
}
