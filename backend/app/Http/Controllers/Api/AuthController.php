<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller {
    public function login(Request $request) {
        $data = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->orWhere('name', $data['email'])->first();

        if (!$user || !$user->activo || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $token = Str::random(64);
        $user->update(['api_token' => $token]);

        return response()->json([
            'token' => $token,
            'user' => $this->conPermisos($user),
        ]);
    }

    public function logout(Request $request) {
        $request->user()?->update(['api_token' => null]);
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function me(Request $request) {
        return response()->json($this->conPermisos($request->user()));
    }

    private function conPermisos(User $user): array {
        $user->load('rol.permisos', 'compania');
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'rol' => $user->rol ? ['id' => $user->rol->id, 'nombre' => $user->rol->nombre] : null,
            'permisos' => $user->rol ? $user->rol->permisos->pluck('clave') : [],
            'es_super_admin' => $user->es_super_admin,
            'compania' => $user->compania ? ['id' => $user->compania->id, 'nombre' => $user->compania->nombre] : null,
        ];
    }
}
