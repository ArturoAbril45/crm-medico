<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Models\PsiquiatriaRegistro;
use Illuminate\Http\Request;

class PsiquiatriaController extends Controller {
    public function pacientes(Request $request) {
        $s = $request->search;
        if (!$s) return response()->json([]);

        return Paciente::where('nombre', 'like', "%$s%")
            ->orWhere('apellido', 'like', "%$s%")
            ->orWhere('numero_documento', 'like', "%$s%")
            ->withCount(['psiquiatriaRegistros as sesiones_count' => fn($q) => $q->where('tipo', 'sesion')])
            ->orderBy('nombre')
            ->limit(20)
            ->get();
    }

    public function registros(Request $request, Paciente $paciente) {
        $query = $paciente->psiquiatriaRegistros();
        if ($request->tipo) $query->where('tipo', $request->tipo);
        return response()->json([
            'paciente' => $paciente,
            'registros' => $query->orderByDesc('fecha')->get(),
        ]);
    }

    private function reglas(): array {
        return [
            'tipo' => 'required|in:sesion,escala,plan',
            'titulo' => 'nullable|string|max:150',
            'contenido' => 'nullable|string',
            'escala_nombre' => 'nullable|string|max:100',
            'escala_puntaje' => 'nullable|integer',
            'fecha' => 'required|date',
        ];
    }

    public function store(Request $request, Paciente $paciente) {
        $registro = $paciente->psiquiatriaRegistros()->create($request->validate($this->reglas()));
        return response()->json($registro, 201);
    }

    public function update(Request $request, PsiquiatriaRegistro $registro) {
        $registro->update($request->validate($this->reglas()));
        return response()->json($registro);
    }

    public function destroy(PsiquiatriaRegistro $registro) {
        $registro->delete();
        return response()->json(['message' => 'Registro eliminado']);
    }
}
