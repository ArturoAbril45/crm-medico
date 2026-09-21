<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medico;
use Illuminate\Http\Request;

class MedicoController extends Controller {
    public function index() {
        return Medico::with('departamento')->where('activo', true)->orderBy('nombre')->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nombre' => 'required|string',
            'especialidad' => 'nullable|string',
            'email' => 'nullable|email',
            'telefono' => 'nullable|string',
            'departamento_id' => 'nullable|exists:departamentos,id',
            'hora_inicio' => 'nullable|string',
            'hora_fin' => 'nullable|string',
            'dias_trabajo' => 'nullable|string',
        ]);
        return response()->json(Medico::create($data)->load('departamento'), 201);
    }

    public function update(Request $request, Medico $medico) {
        $medico->update($request->validate([
            'nombre' => 'sometimes|string',
            'especialidad' => 'nullable|string',
            'email' => 'nullable|email',
            'telefono' => 'nullable|string',
            'departamento_id' => 'nullable|exists:departamentos,id',
            'hora_inicio' => 'nullable|string',
            'hora_fin' => 'nullable|string',
            'dias_trabajo' => 'nullable|string',
            'activo' => 'sometimes|boolean',
        ]));
        return response()->json($medico->load('departamento'));
    }

    public function destroy(Medico $medico) {
        $medico->update(['activo' => false]);
        return response()->json(['message' => 'Médico desactivado']);
    }
}
