<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RespuestaRapida;
use Illuminate\Http\Request;

class RespuestaRapidaController extends Controller {
    public function index() {
        return RespuestaRapida::orderBy('atajo')->get();
    }

    private function reglas(): array {
        return ['atajo' => 'required|string|max:80', 'mensaje' => 'required|string'];
    }

    public function store(Request $request) {
        return response()->json(RespuestaRapida::create($request->validate($this->reglas())), 201);
    }

    public function update(Request $request, RespuestaRapida $respuesta_rapida) {
        $respuesta_rapida->update($request->validate($this->reglas()));
        return response()->json($respuesta_rapida);
    }

    public function destroy(RespuestaRapida $respuesta_rapida) {
        $respuesta_rapida->delete();
        return response()->json(['message' => 'Respuesta rápida eliminada']);
    }
}
