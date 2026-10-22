<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductoMarketplace;
use App\Models\ProveedorMkt;
use Illuminate\Http\Request;

class ProductoMarketplaceController extends Controller {
    public function index(Request $request) {
        $query = ProductoMarketplace::with('proveedor')->where('activo', true);

        if ($request->tipo) $query->where('tipo', $request->tipo);
        if ($request->proveedor_id) $query->where('proveedor_id', $request->proveedor_id);
        if ($request->categoria) $query->where('categoria', $request->categoria);
        if ($request->search) $query->where('nombre', 'like', "%{$request->search}%");
        if (!$request->incluir_propios) $query->whereHas('proveedor', fn($q) => $q->where('es_propio', false));

        return $query->orderBy('nombre')->get();
    }

    public function miTienda() {
        $proveedor = $this->proveedorPropio();
        return ProductoMarketplace::where('proveedor_id', $proveedor->id)->orderByDesc('created_at')->get();
    }

    public function miProveedor() {
        return response()->json($this->proveedorPropio());
    }

    private function proveedorPropio(): ProveedorMkt {
        return ProveedorMkt::firstOrCreate(
            ['es_propio' => true],
            ['nombre' => 'Mi Clínica', 'categoria' => 'servicios']
        );
    }

    private function reglas(): array {
        return [
            'proveedor_id' => 'required|exists:proveedores_mkt,id',
            'nombre' => 'required|string|max:150',
            'categoria' => 'nullable|string|max:100',
            'unidad_medida' => 'nullable|in:unidad,tablet,caja,frasco,paquete',
            'tipo' => 'required|in:fisico,digital',
            'precio' => 'required|numeric',
            'moneda' => 'nullable|string|max:5',
            'stock' => 'nullable|integer',
            'descripcion' => 'nullable|string',
        ];
    }

    public function store(Request $request) {
        return response()->json(ProductoMarketplace::create($request->validate($this->reglas())), 201);
    }

    public function update(Request $request, ProductoMarketplace $producto) {
        $producto->update($request->validate($this->reglas()));
        return response()->json($producto);
    }

    public function destroy(ProductoMarketplace $producto) {
        $producto->delete();
        return response()->json(['message' => 'Producto eliminado']);
    }
}
