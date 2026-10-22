<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Services\GoogleCalendarService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CitaController extends Controller {
    public function __construct(private GoogleCalendarService $googleCalendar) {}

    public function index(Request $request) {
        $query = Cita::with(['paciente', 'procedimiento', 'medico']);

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

    private function camposTurno(): array {
        return [
            'medico_id'        => 'nullable|exists:medicos,id',
            'tipo_consulta'    => 'nullable|in:presencial,telemedicina,alta,emergencia,cirugia',
            'cobertura_tipo'   => 'nullable|in:particular,obra_social',
            'cobertura_nombre' => 'nullable|string|max:150',
            'ubicacion'        => 'nullable|string|max:150',
            'motivo'           => 'nullable|string|max:255',
        ];
    }

    public function store(Request $request) {
        $data = $request->validate(array_merge([
            'paciente_id'      => 'required|exists:pacientes,id',
            'procedimiento_id' => 'nullable|exists:procedimientos,id',
            'doctor'           => 'nullable|string',
            'fecha_hora'       => 'required|date',
            'duracion_min'     => 'nullable|integer|min:15',
            'estado'           => 'nullable|in:pendiente,confirmada,realizada,cancelada,no_asistio',
            'notas'            => 'nullable|string',
            'monto'            => 'nullable|numeric|min:0',
        ], $this->camposTurno()));
        $cita = Cita::create($data)->load(['paciente', 'procedimiento', 'medico']);

        // Si el medico vinculo su Google Calendar, la cita se sincroniza ahi tambien.
        // Si falla por lo que sea, la cita ya quedo creada en el sistema igual.
        if ($cita->medico && $this->googleCalendar->conectado($cita->medico)) {
            $this->googleCalendar->crearEvento($cita->medico, $cita);
        }

        return response()->json($cita, 201);
    }

    public function show(Cita $cita) {
        return $cita->load(['paciente', 'procedimiento', 'medico', 'pagos']);
    }

    public function update(Request $request, Cita $cita) {
        $data = $request->validate(array_merge([
            'paciente_id'      => 'sometimes|exists:pacientes,id',
            'procedimiento_id' => 'nullable|exists:procedimientos,id',
            'doctor'           => 'nullable|string',
            'fecha_hora'       => 'sometimes|date',
            'duracion_min'     => 'nullable|integer',
            'estado'           => 'nullable|in:pendiente,confirmada,realizada,cancelada,no_asistio',
            'notas'            => 'nullable|string',
            'monto'            => 'nullable|numeric',
        ], $this->camposTurno()));
        $cita->update($data);
        return response()->json($cita->load(['paciente', 'procedimiento', 'medico']));
    }

    public function destroy(Cita $cita) {
        if ($cita->google_event_id && $cita->medico) {
            $this->googleCalendar->eliminarEvento($cita->medico, $cita->google_event_id);
        }
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
