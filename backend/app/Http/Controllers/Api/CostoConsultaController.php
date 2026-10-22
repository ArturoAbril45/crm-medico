<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CostoConsulta;
use Illuminate\Http\Request;

class CostoConsultaController extends Controller {
    public function index() {
        return CostoConsulta::orderBy('categoria')->orderBy('denominacion')->get();
    }

    private function reglas(): array {
        return [
            'categoria' => 'required|string|max:150',
            'denominacion' => 'required|string|max:150',
            'valor' => 'required|numeric|min:0',
            'diferencia' => 'nullable|numeric',
            'observaciones' => 'nullable|string|max:255',
        ];
    }

    public function store(Request $request) {
        return response()->json(CostoConsulta::create($request->validate($this->reglas())), 201);
    }

    public function update(Request $request, CostoConsulta $costo) {
        $costo->update($request->validate($this->reglas()));
        return response()->json($costo);
    }

    public function destroy(CostoConsulta $costo) {
        $costo->delete();
        return response()->json(['message' => 'Costo eliminado']);
    }
}
