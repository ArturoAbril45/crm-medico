<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $user = $token ? User::where('api_token', $token)->where('activo', true)->first() : null;

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
