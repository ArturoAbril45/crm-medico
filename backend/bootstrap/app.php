<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // Closure explicito (en vez de los atajos web/api/apiPrefix) porque apiPrefix
        // necesita leer env() en el momento en que las rutas se registran (boot), no
        // cuando este archivo se ejecuta (arranca antes de que Dotenv cargue el .env).
        //
        // En produccion Laravel vive fisicamente en public_html/api/, asi que el path
        // "/api" ya queda absorbido como base path antes de llegar al router (Symfony
        // lo resta de PATH_INFO). Si ademas Laravel le suma su propio prefijo "api"
        // por defecto, las rutas de routes/api.php terminan esperando "api/api/x" y
        // nunca matchean. En local (Laravel sirviendo desde la raiz) si hace falta el
        // prefijo normal. Se controla con API_ROUTE_PREFIX en el .env de cada entorno.
        using: function () {
            Route::middleware('web')->group(__DIR__.'/../routes/web.php');
            Route::middleware('api')->prefix(env('API_ROUTE_PREFIX', 'api'))->group(__DIR__.'/../routes/api.php');
            Route::get('/up', fn () => response()->json(['status' => 'up']));
        },
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        $middleware->alias([
            'auth.token' => \App\Http\Middleware\EnsureTokenIsValid::class,
            'resolve.compania' => \App\Http\Middleware\ResolveCompania::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
