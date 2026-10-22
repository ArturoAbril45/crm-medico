<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantillaInforme;
use Illuminate\Http\Request;

class PlantillaInformeController extends Controller {
    public function index(Request $request) {
        $query = PlantillaInforme::where('activo', true);
        if ($request->tipo_estudio) $query->where('tipo_estudio', $request->tipo_estudio);
        return $query->orderBy('nombre')->get();
    }

    private function reglas(): array {
        return [
            'nombre' => 'required|string|max:150',
            'tipo_estudio' => 'nullable|string|max:150',
            'contenido' => 'required|string',
            'activo' => 'nullable|boolean',
        ];
    }

    public function store(Request $request) {
        return response()->json(PlantillaInforme::create($request->validate($this->reglas())), 201);
    }

    public function update(Request $request, PlantillaInforme $plantilla) {
        $plantilla->update($request->validate($this->reglas()));
        return response()->json($plantilla);
    }

    public function destroy(PlantillaInforme $plantilla) {
        $plantilla->delete();
        return response()->json(['message' => 'Plantilla eliminada']);
    }
}
