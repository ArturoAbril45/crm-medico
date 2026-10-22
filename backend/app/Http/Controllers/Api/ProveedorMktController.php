<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProveedorMkt;
use Illuminate\Http\Request;

class ProveedorMktController extends Controller {
    public function index(Request $request) {
        $query = ProveedorMkt::where('es_propio', false);
        if ($request->categoria) $query->where('categoria', $request->categoria);
        if ($request->provincia) $query->where('provincia', $request->provincia);
        return $query->withCount('productos')->orderBy('nombre')->get();
    }

    private function reglas(): array {
        return [
            'nombre' => 'required|string|max:150',
            'categoria' => 'required|in:laboratorio,farmacia,insumos,equipos,servicios,otro',
            'provincia' => 'nullable|string|max:100',
            'ciudad' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
        ];
    }

    public function store(Request $request) {
        return response()->json(ProveedorMkt::create($request->validate($this->reglas())), 201);
    }

    public function update(Request $request, ProveedorMkt $proveedor) {
        $proveedor->update($request->validate($this->reglas()));
        return response()->json($proveedor);
    }

    public function destroy(ProveedorMkt $proveedor) {
        $proveedor->delete();
        return response()->json(['message' => 'Proveedor eliminado']);
    }
}
