<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consulta;
use Illuminate\Http\Request;

class ConsultaController extends Controller {
    public function index() {
        return Consulta::with(['paciente', 'medico'])->orderBy('fecha', 'desc')->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'medico_id' => 'nullable|exists:medicos,id',
            'cita_id' => 'nullable|exists:citas,id',
            'fecha' => 'required|date',
            'motivo' => 'required|string',
            'diagnostico' => 'nullable|string',
            'tratamiento' => 'nullable|string',
            'notas' => 'nullable|string',
        ]);
        return response()->json(Consulta::create($data)->load(['paciente', 'medico']), 201);
    }

    public function update(Request $request, Consulta $consulta) {
        $consulta->update($request->validate([
            'paciente_id' => 'sometimes|exists:pacientes,id',
            'medico_id' => 'nullable|exists:medicos,id',
            'cita_id' => 'nullable|exists:citas,id',
            'fecha' => 'sometimes|date',
            'motivo' => 'sometimes|string',
            'diagnostico' => 'nullable|string',
            'tratamiento' => 'nullable|string',
            'notas' => 'nullable|string',
        ]));
        return response()->json($consulta->load(['paciente', 'medico']));
    }

    public function destroy(Consulta $consulta) {
        $consulta->delete();
        return response()->json(['message' => 'Consulta eliminada']);
    }
}
