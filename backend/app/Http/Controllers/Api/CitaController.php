<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CitaController extends Controller {
    public function index(Request $request) {
        $query = Cita::with(['paciente', 'procedimiento']);

        if ($request->fecha) $query->whereDate('fecha_hora', $request->fecha);
        if ($request->estado) $query->where('estado', $request->estado);
        if ($request->paciente_id) $query->where('paciente_id', $request->paciente_id);

        if ($request->semana) {
            $inicio = Carbon::now()->startOfWeek();
            $fin = Carbon::now()->endOfWeek();
            $query->whereBetween('fecha_hora', [$inicio, $fin]);
        }

        return $query->orderBy('fecha_hora')->paginate($request->per_page ?? 20);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'paciente_id'      => 'required|exists:pacientes,id',
            'procedimiento_id' => 'nullable|exists:procedimientos,id',
            'doctor'           => 'nullable|string',
            'fecha_hora'       => 'required|date',
            'duracion_min'     => 'nullable|integer|min:15',
            'estado'           => 'nullable|in:pendiente,confirmada,realizada,cancelada,no_asistio',
            'notas'            => 'nullable|string',
            'monto'            => 'nullable|numeric|min:0',
        ]);
        return response()->json(Cita::create($data)->load(['paciente', 'procedimiento']), 201);
    }

    public function show(Cita $cita) {
        return $cita->load(['paciente', 'procedimiento', 'pagos']);
    }

    public function update(Request $request, Cita $cita) {
        $data = $request->validate([
            'paciente_id'      => 'sometimes|exists:pacientes,id',
            'procedimiento_id' => 'nullable|exists:procedimientos,id',
            'doctor'           => 'nullable|string',
            'fecha_hora'       => 'sometimes|date',
            'duracion_min'     => 'nullable|integer',
            'estado'           => 'nullable|in:pendiente,confirmada,realizada,cancelada,no_asistio',
            'notas'            => 'nullable|string',
            'monto'            => 'nullable|numeric',
        ]);
        $cita->update($data);
        return response()->json($cita->load(['paciente', 'procedimiento']));
    }

    public function destroy(Cita $cita) {
        $cita->delete();
        return response()->json(['message' => 'Cita eliminada']);
    }

    public function calendario(Request $request) {
        $inicio = $request->inicio ?? Carbon::now()->startOfMonth()->toDateString();
        $fin = $request->fin ?? Carbon::now()->endOfMonth()->toDateString();

        return Cita::with(['paciente', 'procedimiento'])
            ->whereBetween('fecha_hora', [$inicio . ' 00:00:00', $fin . ' 23:59:59'])
            ->orderBy('fecha_hora')
            ->get();
    }
}
