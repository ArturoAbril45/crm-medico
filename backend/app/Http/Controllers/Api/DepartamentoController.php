<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use Illuminate\Http\Request;

class DepartamentoController extends Controller {
    public function index() {
        return Departamento::with('medicos')->orderBy('nombre')->get();
    }

    private function reglas(): array {
        return [
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:500',
            'administrador_nombre' => 'nullable|string|max:150',
            'administrador_email' => 'nullable|email|max:150',
            'medico_ids' => 'nullable|array',
            'medico_ids.*' => 'integer|exists:medicos,id',
        ];
    }

    public function store(Request $request) {
        $data = $request->validate($this->reglas());
        $depto = Departamento::create($data);
        $depto->medicos()->sync($data['medico_ids'] ?? []);
        return response()->json($depto->load('medicos'), 201);
    }

    public function update(Request $request, Departamento $departamento) {
        $data = $request->validate($this->reglas());
        $departamento->update($data);
        $departamento->medicos()->sync($data['medico_ids'] ?? []);
        return response()->json($departamento->load('medicos'));
    }

    public function destroy(Departamento $departamento) {
        $departamento->delete();
        return response()->json(['message' => 'Departamento eliminado']);
    }
}
