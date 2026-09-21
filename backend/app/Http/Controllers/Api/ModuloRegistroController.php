<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModuloRegistro;
use Illuminate\Http\Request;

class ModuloRegistroController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['modulo' => 'required|string']);
        return ModuloRegistro::where('modulo', $request->query('modulo'))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'modulo' => 'required|string',
            'titulo' => 'required|string',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string',
            'fecha' => 'nullable|date',
            'datos' => 'nullable|array',
        ]);
        return response()->json(ModuloRegistro::create($data), 201);
    }

    public function update(Request $request, ModuloRegistro $registro)
    {
        $registro->update($request->validate([
            'titulo' => 'sometimes|string',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|string',
            'fecha' => 'nullable|date',
            'datos' => 'nullable|array',
        ]));
        return response()->json($registro);
    }

    public function destroy(ModuloRegistro $registro)
    {
        $registro->delete();
        return response()->json(['message' => 'Registro eliminado']);
    }
}
