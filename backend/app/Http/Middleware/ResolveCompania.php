<?php

namespace App\Http\Middleware;

use App\Support\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Corre despues de EnsureTokenIsValid. Fija la compania activa del request:
 * - Usuario normal: su propia compania_id, siempre.
 * - Super-admin: normalmente null (ve el panel de companias), salvo que pase
 *   ?compania_id= para "entrar como" una compania puntual (paneles de soporte).
 */
class ResolveCompania
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user->es_super_admin) {
            $comoCompania = $request->query('compania_id');
            // Sin ?compania_id= explicito, un super-admin opera sobre su propia
            // compania (si tiene una asignada) en vez de quedar sin compania activa.
            Tenant::set($comoCompania ? (int) $comoCompania : $user->compania_id);
        } else {
            Tenant::set($user->compania_id);
        }

        return $next($request);
    }
}
