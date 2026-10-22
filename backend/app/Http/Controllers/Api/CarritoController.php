<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarritoItem;
use App\Models\PedidoMkt;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CarritoController extends Controller {
    public function index() {
        $items = CarritoItem::with(['producto.proveedor'])->get();
        return response()->json([
            'items' => $items,
            'total' => $items->sum(fn($i) => $i->cantidad * ($i->producto->precio ?? 0)),
        ]);
    }

    public function agregar(Request $request) {
        $data = $request->validate([
            'producto_id' => 'required|exists:productos_marketplace,id',
            'cantidad' => 'nullable|integer|min:1',
        ]);
        $item = CarritoItem::firstOrNew(['producto_id' => $data['producto_id']]);
        $item->cantidad = ($item->exists ? $item->cantidad : 0) + ($data['cantidad'] ?? 1);
        $item->save();
        return response()->json($item->load('producto'), 201);
    }

    public function actualizar(Request $request, CarritoItem $item) {
        $data = $request->validate(['cantidad' => 'required|integer|min:1']);
        $item->update($data);
        return response()->json($item);
    }

    public function eliminar(CarritoItem $item) {
        $item->delete();
        return response()->json(['message' => 'Ítem eliminado del carrito']);
    }

    public function checkout() {
        $items = CarritoItem::with(['producto.proveedor'])->get();
        if ($items->isEmpty()) {
            return response()->json(['message' => 'El carrito está vacío'], 422);
        }

        $pedido = PedidoMkt::create([
            'codigo' => 'PED-' . strtoupper(Str::random(6)),
            'total' => $items->sum(fn($i) => $i->cantidad * $i->producto->precio),
            'estado' => 'pendiente',
            'fecha' => now()->toDateString(),
        ]);

        foreach ($items as $item) {
            $pedido->items()->create([
                'producto_id' => $item->producto_id,
                'proveedor_id' => $item->producto->proveedor_id,
                'nombre_producto' => $item->producto->nombre,
                'cantidad' => $item->cantidad,
                'precio_unitario' => $item->producto->precio,
            ]);
        }

        CarritoItem::query()->delete();

        return response()->json($pedido->load('items'), 201);
    }
}
