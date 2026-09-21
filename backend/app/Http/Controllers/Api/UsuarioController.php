<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        return User::with('medico')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100',
            'usuario'   => 'required|string|max:50|unique:users,usuario',
            'password'  => 'required|string|min:4',
            'rol'       => 'required|string',
            'medico_id' => 'nullable|exists:medicos,id',
            'permisos'  => 'nullable|array',
            'activo'    => 'nullable|boolean',
        ]);
        $data['email'] = $data['usuario'] . '@medadvance360.com';
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        return response()->json($user->load('medico'), 201);
    }

    public function update(Request $request, User $usuario)
    {
        $data = $request->validate([
            'name'      => 'sometimes|string|max:100',
            'usuario'   => 'sometimes|string|max:50|unique:users,usuario,' . $usuario->id,
            'password'  => 'nullable|string|min:4',
            'rol'       => 'sometimes|string',
            'medico_id' => 'nullable|exists:medicos,id',
            'permisos'  => 'nullable|array',
            'activo'    => 'nullable|boolean',
        ]);
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $usuario->update($data);
        return response()->json($usuario->load('medico'));
    }

    public function destroy(User $usuario)
    {
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
