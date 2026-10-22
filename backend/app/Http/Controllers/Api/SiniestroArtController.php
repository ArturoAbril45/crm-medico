<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiniestroArt;
use Illuminate\Http\Request;

class SiniestroArtController extends Controller {
    public function index(Request $request) {
        $query = SiniestroArt::with('empleado');
        if ($request->estado) $query->where('estado', $request->estado);
        if ($request->tipo) $query->where('tipo', $request->tipo);
        return $query->orderByDesc('fecha_siniestro')->get();
    }

    private function reglas(): array {
        return [
            'empleado_id' => 'required|exists:empleados,id',
            'tipo' => 'required|in:accidente_trabajo,enfermedad_profesional,accidente_in_itinere',
            'fecha_siniestro' => 'required|date',
            'descripcion' => 'required|string',
            'art_nombre' => 'nullable|string|max:150',
            'numero_siniestro' => 'nullable|string|max:50',
            'estado' => 'nullable|in:denunciado,en_tratamiento,alta_medica,rechazado',
            'dias_baja' => 'nullable|integer|min:0',
            'fecha_alta' => 'nullable|date',
        ];
    }

    public function store(Request $request) {
        $siniestro = SiniestroArt::create($request->validate($this->reglas()));
        return response()->json($siniestro->load('empleado'), 201);
    }

    public function update(Request $request, SiniestroArt $siniestro) {
        $reglas = collect($this->reglas())->map(fn($r) => 'sometimes|' . $r)->toArray();
        $siniestro->update($request->validate($reglas));
        return response()->json($siniestro->load('empleado'));
    }

    public function destroy(SiniestroArt $siniestro) {
        $siniestro->delete();
        return response()->json(['message' => 'Siniestro eliminado']);
    }
}
