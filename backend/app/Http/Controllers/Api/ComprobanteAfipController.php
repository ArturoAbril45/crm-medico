<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComprobanteAfip;
use Illuminate\Http\Request;

class ComprobanteAfipController extends Controller {
    public function index(Request $request) {
        $query = ComprobanteAfip::with('paciente');
        if ($request->tipo_comprobante) $query->where('tipo_comprobante', $request->tipo_comprobante);
        if ($request->estado) $query->where('estado', $request->estado);
        return $query->orderByDesc('fecha')->orderByDesc('numero')->get();
    }

    private function reglas(): array {
        return [
            'paciente_id' => 'nullable|exists:pacientes,id',
            'tipo_comprobante' => 'required|in:factura_a,factura_b,factura_c,nota_credito_a,nota_credito_b,nota_credito_c,nota_debito_a,nota_debito_b,nota_debito_c',
            'monto' => 'required|numeric|min:0',
            'fecha' => 'required|date',
        ];
    }

    public function store(Request $request) {
        $data = $request->validate($this->reglas());
        $ultimo = ComprobanteAfip::where('tipo_comprobante', $data['tipo_comprobante'])->max('numero');
        $data['numero'] = ($ultimo ?? 0) + 1;
        $data['estado'] = 'borrador';

        return response()->json(ComprobanteAfip::create($data)->load('paciente'), 201);
    }

    public function emitir(ComprobanteAfip $comprobante) {
        if ($comprobante->estado !== 'borrador') {
            return response()->json(['message' => 'El comprobante ya fue emitido o anulado'], 422);
        }

        // Simulacion de CAE: no hay integracion real con el webservice WSFE de AFIP
        // (requiere certificado digital y clave fiscal del contribuyente). El CAE
        // generado aqui es de prueba, para que el flujo sea usable hasta conectar
        // la integracion real.
        $comprobante->update([
            'estado' => 'emitido',
            'cae' => str_pad((string) random_int(0, 99999999999999), 14, '0', STR_PAD_LEFT),
            'cae_vencimiento' => now()->addDays(10)->toDateString(),
        ]);

        return response()->json($comprobante->load('paciente'));
    }

    public function anular(ComprobanteAfip $comprobante) {
        $comprobante->update(['estado' => 'anulado']);
        return response()->json($comprobante);
    }

    public function destroy(ComprobanteAfip $comprobante) {
        if ($comprobante->estado === 'emitido') {
            return response()->json(['message' => 'No se puede eliminar un comprobante emitido, anúlalo en su lugar'], 422);
        }
        $comprobante->delete();
        return response()->json(['message' => 'Comprobante eliminado']);
    }
}
