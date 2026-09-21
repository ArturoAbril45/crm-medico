<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use Illuminate\Http\Request;

class DepartamentoController extends Controller {
    public function index() {
        return Departamento::withCount('medicos')->orderBy('nombre')->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nombre' => 'required|string',
            'descripcion' => 'nullable|string',
        ]);
        return response()->json(Departamento::create($data), 201);
    }

    public function update(Request $request, Departamento $departamento) {
        $departamento->update($request->validate([
            'nombre' => 'sometimes|string',
            'descripcion' => 'nullable|string',
            'activo' => 'sometimes|boolean',
        ]));
        return response()->json($departamento);
    }

    public function destroy(Departamento $departamento) {
        $departamento->update(['activo' => false]);
        return response()->json(['message' => 'Departamento desactivado']);
    }
}
