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
            'nombre'                => 'required|string',
            'descripcion'           => 'nullable|string',
            'categoria'             => 'required|string',
            'precio_consulta'       => 'nullable|numeric|min:0',
            'precio_procedimiento'  => 'nullable|numeric|min:0',
            'tipo_precio'           => 'nullable|in:fijo,porcentaje',
            'precio_base'           => 'nullable|numeric|min:0',
            'porcentaje_descuento'  => 'nullable|numeric|min:0|max:100',
            'duracion_min'          => 'nullable|integer|min:15',
        ]);
        $data = $this->calcularPrecioFinal($data);
        return response()->json(Procedimiento::create($data), 201);
    }

    public function update(Request $request, Procedimiento $procedimiento) {
        $data = $request->validate([
            'nombre'                => 'sometimes|string',
            'descripcion'           => 'nullable|string',
            'categoria'             => 'sometimes|string',
            'precio_consulta'       => 'nullable|numeric|min:0',
            'precio_procedimiento'  => 'nullable|numeric|min:0',
            'tipo_precio'           => 'nullable|in:fijo,porcentaje',
            'precio_base'           => 'nullable|numeric|min:0',
            'porcentaje_descuento'  => 'nullable|numeric|min:0|max:100',
            'duracion_min'          => 'nullable|integer|min:15',
        ]);
        $data = $this->calcularPrecioFinal($data);
        $procedimiento->update($data);
        return response()->json($procedimiento);
    }

    // Cuando el precio es "por porcentaje", el precio_procedimiento final se
    // calcula acá (base - descuento%) en vez de confiar en lo que mande el
    // frontend, para que el número que ve el resto del sistema (Citas, etc.)
    // siempre sea consistente con la base y el porcentaje guardados.
    private function calcularPrecioFinal(array $data): array {
        if (($data['tipo_precio'] ?? null) === 'porcentaje' && isset($data['precio_base'])) {
            $porcentaje = $data['porcentaje_descuento'] ?? 0;
            $data['precio_procedimiento'] = round($data['precio_base'] * (1 - $porcentaje / 100), 2);
        }
        return $data;
    }

    public function destroy(Procedimiento $procedimiento) {
        $procedimiento->update(['activo' => false]);
        return response()->json(['message' => 'Procedimiento desactivado']);
    }
}
