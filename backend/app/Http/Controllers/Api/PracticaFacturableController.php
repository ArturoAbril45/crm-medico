<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PracticaFacturable;
use Illuminate\Http\Request;

class PracticaFacturableController extends Controller {
    public function index(Request $request) {
        $query = PracticaFacturable::with(['paciente', 'medico', 'convenio', 'prestacion']);

        $periodo = $request->periodo ?? now()->format('Y-m');
        $query->whereRaw("DATE_FORMAT(fecha, '%Y-%m') = ?", [$periodo]);

        if ($request->estado) $query->where('estado', $request->estado);

        return response()->json([
            'periodo' => $periodo,
            'practicas' => $query->orderByDesc('fecha')->get(),
        ]);
    }

    private function reglas(): array {
        return [
            'paciente_id' => 'required|exists:pacientes,id',
            'medico_id' => 'nullable|exists:medicos,id',
            'convenio_id' => 'nullable|exists:convenios,id',
            'prestacion_id' => 'nullable|exists:prestaciones,id',
            'monto' => 'required|numeric',
            'estado' => 'nullable|in:sin_marcar,lista,presentada,debitada,cobrada,anulada',
            'fecha' => 'required|date',
        ];
    }

    public function store(Request $request) {
        $practica = PracticaFacturable::create($request->validate($this->reglas()));
        return response()->json($practica->load(['paciente', 'medico', 'convenio', 'prestacion']), 201);
    }

    public function update(Request $request, PracticaFacturable $practica) {
        $practica->update($request->validate(array_merge($this->reglas(), [
            'paciente_id' => 'sometimes|exists:pacientes,id',
            'monto' => 'sometimes|numeric',
            'fecha' => 'sometimes|date',
        ])));
        return response()->json($practica->load(['paciente', 'medico', 'convenio', 'prestacion']));
    }

    public function destroy(PracticaFacturable $practica) {
        $practica->delete();
        return response()->json(['message' => 'Práctica eliminada']);
    }
}
