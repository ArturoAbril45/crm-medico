<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cotizacion;
use Illuminate\Http\Request;

class CotizacionController extends Controller {
    public function index() {
        return Cotizacion::with(['proveedor', 'items'])->orderByDesc('fecha')->get();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'proveedor_id' => 'required|exists:proveedores_mkt,id',
            'mensaje' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.descripcion' => 'required|string|max:200',
            'items.*.cantidad' => 'required|integer|min:1',
            'items.*.producto_id' => 'nullable|exists:productos_marketplace,id',
        ]);

        $cotizacion = Cotizacion::create([
            'proveedor_id' => $data['proveedor_id'],
            'mensaje' => $data['mensaje'] ?? null,
            'estado' => 'pendiente',
            'fecha' => now()->toDateString(),
        ]);
        $cotizacion->items()->createMany($data['items']);

        return response()->json($cotizacion->load(['proveedor', 'items']), 201);
    }

    public function update(Request $request, Cotizacion $cotizacion) {
        $data = $request->validate(['estado' => 'required|in:pendiente,respondida,aceptada,rechazada']);
        $cotizacion->update($data);
        return response()->json($cotizacion);
    }

    public function destroy(Cotizacion $cotizacion) {
        $cotizacion->delete();
        return response()->json(['message' => 'Cotización eliminada']);
    }
}
