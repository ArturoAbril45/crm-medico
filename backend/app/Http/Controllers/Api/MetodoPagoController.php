<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MetodoPago;
use Illuminate\Http\Request;

class MetodoPagoController extends Controller {
    public function index() {
        return MetodoPago::orderBy('orden')->get();
    }

    public function inicializar() {
        if (MetodoPago::count() > 0) {
            return response()->json(['message' => 'Ya hay métodos de pago configurados'], 422);
        }

        $defaults = [
            ['nombre' => 'Efectivo', 'tipo' => 'efectivo', 'orden' => 1],
            ['nombre' => 'Tarjeta', 'tipo' => 'tarjeta', 'orden' => 2],
            ['nombre' => 'Transferencia Bancaria', 'tipo' => 'transferencia', 'orden' => 3],
            ['nombre' => 'QR', 'tipo' => 'qr', 'orden' => 4],
        ];
        foreach ($defaults as $d) MetodoPago::create($d);

        return response()->json(MetodoPago::orderBy('orden')->get(), 201);
    }

    private function reglas(): array {
        return [
            'nombre' => 'required|string|max:100',
            'tipo' => 'required|in:efectivo,tarjeta,transferencia,qr',
            'cuenta_referencia' => 'nullable|string|max:150',
            'comision_porcentaje' => 'nullable|numeric|min:0|max:100',
            'activo' => 'nullable|boolean',
            'orden' => 'nullable|integer',
        ];
    }

    public function store(Request $request) {
        $data = $request->validate($this->reglas());
        $data['comision_porcentaje'] = $data['comision_porcentaje'] ?? 0;
        return response()->json(MetodoPago::create($data), 201);
    }

    public function update(Request $request, MetodoPago $metodo) {
        $data = $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'tipo' => 'sometimes|in:efectivo,tarjeta,transferencia,qr',
            'cuenta_referencia' => 'sometimes|nullable|string|max:150',
            'comision_porcentaje' => 'sometimes|nullable|numeric|min:0|max:100',
            'activo' => 'sometimes|boolean',
            'orden' => 'sometimes|integer',
        ]);
        if (array_key_exists('comision_porcentaje', $data)) $data['comision_porcentaje'] = $data['comision_porcentaje'] ?? 0;
        $metodo->update($data);
        return response()->json($metodo);
    }

    public function destroy(MetodoPago $metodo) {
        $metodo->delete();
        return response()->json(['message' => 'Método de pago eliminado']);
    }
}
