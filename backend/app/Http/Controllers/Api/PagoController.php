<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Pago, Paciente};
use Illuminate\Http\Request;

class PagoController extends Controller {
    public function index(Request $request) {
        $query = Pago::with(['paciente', 'cita']);
        if ($request->paciente_id) $query->where('paciente_id', $request->paciente_id);
        if ($request->estado) $query->where('estado', $request->estado);
        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'paciente_id' => 'required|exists:pacientes,id',
            'cita_id'     => 'nullable|exists:citas,id',
            'monto'       => 'required|numeric|min:0',
            'moneda'      => 'nullable|string',
            'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia,qr',
            'estado'      => 'nullable|in:pendiente,completado,cancelado,reembolsado',
            'referencia'  => 'nullable|string',
            'notas'       => 'nullable|string',
            'fecha'       => 'required|date',
        ]);

        $pago = Pago::create($data);

        // Actualizar total_gastado del paciente
        if ($pago->estado === 'completado') {
            Paciente::find($pago->paciente_id)->increment('total_gastado', $pago->monto);
        }

        return response()->json($pago->load(['paciente', 'cita']), 201);
    }

    public function update(Request $request, Pago $pago) {
        $pago->update($request->all());
        return response()->json($pago->load(['paciente', 'cita']));
    }
}
