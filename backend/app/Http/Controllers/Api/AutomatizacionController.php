<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Automatizacion;
use Illuminate\Http\Request;

class AutomatizacionController extends Controller {
    public function index() {
        return Automatizacion::with('flujo')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nombre'       => 'required|string',
            'flujo_id'     => 'nullable|exists:flujos,id',
            'tipo'         => 'required|in:palabra_clave,evento,horario',
            'palabra_clave'=> 'nullable|string',
            'condicion'    => 'nullable|in:contiene,es_igual,empieza_con,cualquiera',
            'activo'       => 'nullable|boolean',
        ]);
        return response()->json(Automatizacion::create($data)->load('flujo'), 201);
    }

    public function update(Request $request, Automatizacion $automatizacion) {
        $automatizacion->update($request->all());
        return response()->json($automatizacion->load('flujo'));
    }

    public function toggle(Automatizacion $automatizacion) {
        $automatizacion->update(['activo' => !$automatizacion->activo]);
        return response()->json($automatizacion);
    }

    public function destroy(Automatizacion $automatizacion) {
        $automatizacion->delete();
        return response()->json(['message' => 'Automatización eliminada']);
    }
}
