<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller {
    public function index() {
        $query = User::with('rol')->orderBy('name');
        if (Tenant::companiaId() !== null) {
            $query->where('compania_id', Tenant::companiaId());
        }
        return $query->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'rol_id' => 'nullable|exists:roles,id',
            'activo' => 'nullable|boolean',
        ]);
        $data['password'] = Hash::make($data['password']);
        if (Tenant::companiaId() !== null) {
            $data['compania_id'] = Tenant::companiaId();
        }

        return response()->json(User::create($data)->load('rol'), 201);
    }

    public function update(Request $request, User $user) {
        $data = $request->validate([
            'name' => 'sometimes|string|max:150',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|nullable|string|min:6',
            'rol_id' => 'sometimes|nullable|exists:roles,id',
            'activo' => 'sometimes|boolean',
        ]);
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);
        return response()->json($user->load('rol'));
    }

    public function destroy(Request $request, User $user) {
        if ($request->user()?->id === $user->id) {
            return response()->json(['message' => 'No podés eliminar tu propio usuario'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
