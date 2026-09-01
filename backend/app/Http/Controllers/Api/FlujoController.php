<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Flujo, Bloque};
use Illuminate\Http\Request;

class FlujoController extends Controller {
    public function index() {
        return Flujo::withCount('bloques')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request) {
        $data = $request->validate(['nombre' => 'required|string', 'descripcion' => 'nullable|string']);
        $flujo = Flujo::create($data);

        // Crear bloque inicial automáticamente
        Bloque::create([
            'flujo_id' => $flujo->id,
            'tipo' => 'inicio',
            'pos_x' => 50, 'pos_y' => 300,
            'config' => ['titulo' => 'Inicio del flujo'],
        ]);
        return response()->json($flujo->load('bloques'), 201);
    }

    public function show(Flujo $flujo) {
        return $flujo->load('bloques');
    }

    public function update(Request $request, Flujo $flujo) {
        $flujo->update($request->validate([
            'nombre' => 'sometimes|string',
            'descripcion' => 'nullable|string',
            'activo' => 'sometimes|boolean',
        ]));
        return response()->json($flujo);
    }

    public function destroy(Flujo $flujo) {
        $flujo->delete();
        return response()->json(['message' => 'Flujo eliminado']);
    }

    public function guardarBloques(Request $request, Flujo $flujo) {
        $bloques = $request->validate(['bloques' => 'required|array'])['bloques'];

        $flujo->bloques()->delete();
        foreach ($bloques as $b) {
            Bloque::create(array_merge($b, ['flujo_id' => $flujo->id]));
        }
        return response()->json(['message' => 'Flujo guardado', 'bloques' => $flujo->bloques]);
    }
}
