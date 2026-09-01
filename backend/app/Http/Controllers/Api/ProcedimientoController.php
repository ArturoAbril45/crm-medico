<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Procedimiento;
use Illuminate\Http\Request;

class ProcedimientoController extends Controller {
    public function index() {
        return Procedimiento::where('activo', true)->orderBy('categoria')->orderBy('nombre')->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nombre'               => 'required|string',
            'descripcion'          => 'nullable|string',
            'categoria'            => 'required|string',
            'precio_consulta'      => 'nullable|numeric|min:0',
            'precio_procedimiento' => 'nullable|numeric|min:0',
            'duracion_min'         => 'nullable|integer|min:15',
        ]);
        return response()->json(Procedimiento::create($data), 201);
    }

    public function update(Request $request, Procedimiento $procedimiento) {
        $procedimiento->update($request->all());
        return response()->json($procedimiento);
    }

    public function destroy(Procedimiento $procedimiento) {
        $procedimiento->update(['activo' => false]);
        return response()->json(['message' => 'Procedimiento desactivado']);
    }
}
