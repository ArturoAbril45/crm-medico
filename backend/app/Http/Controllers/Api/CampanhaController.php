<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campanha;
use Illuminate\Http\Request;

class CampanhaController extends Controller {
    public function index() {
        return response()->json(Campanha::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nombre'      => 'required|string|max:200',
            'descripcion' => 'nullable|string',
            'estado'      => 'nullable|in:activa,pausada,archivada',
        ]);
        return response()->json(Campanha::create($data), 201);
    }

    public function update(Request $request, Campanha $campanha) {
        $data = $request->validate([
            'nombre'         => 'sometimes|string|max:200',
            'descripcion'    => 'nullable|string',
            'participantes'  => 'nullable|integer',
            'ejecuciones'    => 'nullable|integer',
            'ctr'            => 'nullable|numeric',
            'estado'         => 'nullable|in:activa,pausada,archivada',
        ]);
        $campanha->update($data);
        return response()->json($campanha);
    }

    public function destroy(Campanha $campanha) {
        $campanha->delete();
        return response()->json(['message' => 'Campaña eliminada']);
    }
}
