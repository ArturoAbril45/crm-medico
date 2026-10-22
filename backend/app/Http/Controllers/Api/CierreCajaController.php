<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CierreCaja;
use App\Models\Pago;
use Illuminate\Http\Request;

class CierreCajaController extends Controller {
    public function index(Request $request) {
        return CierreCaja::orderByDesc('fecha')->limit($request->limit ?? 30)->get();
    }

    public function hoy() {
        $fecha = now()->toDateString();
        $cierre = CierreCaja::firstOrNew(['fecha' => $fecha]);

        if (!$cierre->exists || $cierre->estado === 'abierto') {
            $totales = Pago::where('estado', 'completado')
                ->whereDate('fecha', $fecha)
                ->selectRaw('metodo_pago, SUM(monto) as total')
                ->groupBy('metodo_pago')
                ->pluck('total', 'metodo_pago');

            $cierre->fecha = $fecha;
            $cierre->total_efectivo = $totales['efectivo'] ?? 0;
            $cierre->total_tarjeta = $totales['tarjeta'] ?? 0;
            $cierre->total_transferencia = $totales['transferencia'] ?? 0;
            $cierre->total_qr = $totales['qr'] ?? 0;
            $cierre->estado = $cierre->estado ?? 'abierto';
            $cierre->save();
        }

        return response()->json($cierre);
    }

    public function cerrar(Request $request, CierreCaja $cierre) {
        $data = $request->validate([
            'egresos' => 'nullable|numeric',
            'observaciones' => 'nullable|string',
        ]);
        $cierre->update(array_merge($data, [
            'estado' => 'cerrado',
            'cerrado_en' => now(),
        ]));
        return response()->json($cierre);
    }

    public function reabrir(CierreCaja $cierre) {
        $cierre->update(['estado' => 'abierto', 'cerrado_en' => null]);
        return response()->json($cierre);
    }
}
