<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permiso;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller {
    public function index() {
        return Role::withCount('usuarios')->with('permisos')->orderBy('nombre')->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nombre' => 'required|string|max:100|unique:roles,nombre',
            'descripcion' => 'nullable|string',
            'permisos' => 'nullable|array',
            'permisos.*' => 'exists:permisos,id',
        ]);

        $role = Role::create(['nombre' => $data['nombre'], 'descripcion' => $data['descripcion'] ?? null]);
        if (!empty($data['permisos'])) $role->permisos()->sync($data['permisos']);

        return response()->json($role->load('permisos'), 201);
    }

    public function update(Request $request, Role $role) {
        $data = $request->validate([
            'nombre' => 'sometimes|string|max:100|unique:roles,nombre,' . $role->id,
            'descripcion' => 'sometimes|nullable|string',
            'permisos' => 'sometimes|array',
            'permisos.*' => 'exists:permisos,id',
        ]);

        $role->update(collect($data)->except('permisos')->toArray());
        if (array_key_exists('permisos', $data)) $role->permisos()->sync($data['permisos']);

        return response()->json($role->load('permisos'));
    }

    public function destroy(Role $role) {
        if ($role->usuarios()->exists()) {
            return response()->json(['message' => 'No se puede eliminar un rol con usuarios asignados'], 422);
        }
        $role->delete();
        return response()->json(['message' => 'Rol eliminado']);
    }

    public function permisos() {
        return Permiso::orderBy('categoria')->orderBy('nombre')->get()->groupBy('categoria');
    }
}
