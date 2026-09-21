<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'usuario' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('usuario', $data['usuario'])->first();

        if (!$user || !$user->activo || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Usuario o contraseña incorrectos'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'nombre' => $user->name,
            'usuario' => $user->usuario,
            'rol' => $user->rol,
            'permisos' => $user->permisos,
            'medico_id' => $user->medico_id,
        ]);
    }
}
