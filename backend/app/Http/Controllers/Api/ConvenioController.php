<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Convenio;
use Illuminate\Http\Request;

class ConvenioController extends Controller {
    public function index() {
        return Convenio::orderBy('nombre')->get();
    }

    private function reglas(): array {
        return [
            'nombre' => 'required|string|max:150',
            'codigo' => 'nullable|string|max:50',
            'reglas_facturacion' => 'nullable|string',
        ];
    }

    public function store(Request $request) {
        return response()->json(Convenio::create($request->validate($this->reglas())), 201);
    }

    public function update(Request $request, Convenio $convenio) {
        $convenio->update($request->validate($this->reglas()));
        return response()->json($convenio);
    }

    public function destroy(Convenio $convenio) {
        $convenio->delete();
        return response()->json(['message' => 'Convenio eliminado']);
    }
}
