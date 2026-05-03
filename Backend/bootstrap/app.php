<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CorsMiddleware;
use Illuminate\Foundation\Configuration\Paths;
use Illuminate\Foundation\Configuration\Providers;
use Illuminate\Foundation\Configuration\Routes;
use Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables;
use Illuminate\Foundation\Bootstrap\HandleExceptions;
use Illuminate\Foundation\Bootstrap\RegisterFacades;
use Illuminate\Foundation\Bootstrap\RegisterProviders;
use Illuminate\Foundation\Bootstrap\BootProviders;
use Illuminate\Foundation\Bootstrap\HandleCors;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
      web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',

    )
    ->withMiddleware(function (Middleware $middleware): void {
       $middleware->alias([
            'profile.complete' => \App\Http\Middleware\EnsureProfileIsCompleted::class,
             'admin' => \App\Http\Middleware\AdminMiddleware::class,
             'role'=> \App\Http\Middleware\CheckRole::class,
             'Client' => \App\Http\Middleware\ClientMiddleware::class,
            'profile.completed' => \App\Http\Middleware\CheckProfileCompleted::class,
        ]);

       $middleware->web(append: [
              \App\Http\Middleware\HandleInertiaRequests::class,
              \Illuminate\Http\Middleware\HandleCors::class,
              \App\Http\Middleware\Cors::class,

        ]);
        $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
    $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);
      $middleware->prepend(CorsMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
