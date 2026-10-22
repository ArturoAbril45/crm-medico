<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Medico, HorarioMedico, Cita, User};
use App\Services\GoogleCalendarService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MedicoController extends Controller {
    public function __construct(private GoogleCalendarService $googleCalendar) {}

    public function index(Request $request) {
        $query = Medico::query();
        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nombre', 'like', "%$s%")
                  ->orWhere('apellido', 'like', "%$s%")
                  ->orWhere('especialidad', 'like', "%$s%");
            });
        }
        if ($request->especialidad) $query->where('especialidad', $request->especialidad);
        if ($request->has('activo')) $query->where('activo', $request->boolean('activo'));
        return $query->orderBy('apellido')->paginate($request->per_page ?? 50);
    }

    public function especialidades() {
        return Medico::whereNotNull('especialidad')->where('especialidad', '!=', '')
            ->distinct()->orderBy('especialidad')->pluck('especialidad');
    }

    public function disponibilidad(Request $request, Medico $medico) {
        $data = $request->validate(['fecha' => 'required|date']);
        $fecha = Carbon::parse($data['fecha']);
        $diaSemana = $fecha->dayOfWeek; // 0 (domingo) a 6 (sabado), igual a como se guarda dias_semana

        $horarios = HorarioMedico::where('medico_id', $medico->id)
            ->where(function ($q) use ($fecha) {
                $q->whereNull('valido_desde')->orWhere('valido_desde', '<=', $fecha);
            })
            ->where(function ($q) use ($fecha) {
                $q->whereNull('valido_hasta')->orWhere('valido_hasta', '>=', $fecha);
            })
            ->get()
            ->filter(fn ($h) => empty($h->dias_semana) || in_array($diaSemana, $h->dias_semana));

        $ocupados = Cita::where('medico_id', $medico->id)
            ->whereDate('fecha_hora', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->get(['fecha_hora', 'duracion_min']);

        $slots = [];
        foreach ($horarios as $h) {
            $duracion = $h->duracion_turno ?: 30;
            $cursor = Carbon::parse($fecha->toDateString() . ' ' . $h->hora_inicio);
            $fin = Carbon::parse($fecha->toDateString() . ' ' . $h->hora_fin);
            while ($cursor->copy()->addMinutes($duracion)->lte($fin)) {
                $ocupado = $ocupados->contains(function ($c) use ($cursor, $duracion) {
                    $inicioCita = Carbon::parse($c->fecha_hora);
                    $finCita = $inicioCita->copy()->addMinutes($c->duracion_min ?: 30);
                    return $cursor->lt($finCita) && $cursor->copy()->addMinutes($duracion)->gt($inicioCita);
                });
                if (!$ocupado && $cursor->gt(now())) {
                    $slots[] = ['hora' => $cursor->format('H:i'), 'fecha_hora' => $cursor->toDateTimeString(), 'duracion_min' => $duracion];
                }
                $cursor->addMinutes($duracion);
            }
        }

        return response()->json(['fecha' => $fecha->toDateString(), 'slots' => $slots]);
    }

    /**
     * Arranca la vinculacion OAuth para UN medico puntual. Es una ruta publica
     * (el navegador navega directo hacia Google, no es un llamado ajax con el
     * header Authorization) asi que el token de sesion viaja por query string
     * y se valida a mano acá.
     */
    public function googleConnect(Request $request, Medico $medico) {
        $user = User::where('api_token', $request->query('token'))->first();
        if (!$user) abort(401, 'No autenticado');

        $state = base64_encode(json_encode(['medico_id' => $medico->id]));
        return redirect($this->googleCalendar->urlAutorizacion($state));
    }

    /** Google vuelve acá despues de que el medico autoriza (o cancela). Ruta publica. */
    public function googleCallback(Request $request) {
        $frontend = rtrim(env('APP_URL_FRONTEND', 'https://medadvance360.com'), '/') . '/clinica/medicos';
        $state = json_decode(base64_decode((string) $request->query('state', '')), true);
        $medico = Medico::find($state['medico_id'] ?? null);

        if (!$medico || !$request->query('code')) {
            return redirect("{$frontend}?google=error");
        }

        $tokens = $this->googleCalendar->intercambiarCodigo($request->query('code'));
        if (!$tokens || empty($tokens['refresh_token'])) {
            return redirect("{$frontend}?google=error");
        }

        $medico->update([
            'google_refresh_token' => $tokens['refresh_token'],
            'google_access_token' => $tokens['access_token'] ?? null,
            'google_token_expira' => now()->addSeconds(($tokens['expires_in'] ?? 3600) - 60),
        ]);

        return redirect("{$frontend}?google=ok");
    }

    public function googleDisconnect(Medico $medico) {
        $this->googleCalendar->desconectar($medico);
        return response()->json(['message' => 'Cuenta de Google desvinculada']);
    }

    private function camposProfesionales(): array {
        return [
            'subespecialidad'   => 'nullable|string|max:150',
            'numero_licencia'   => 'nullable|string|max:50',
            'pais_licencia'     => 'nullable|string|max:100',
            'anos_experiencia'  => 'nullable|integer|min:0|max:80',
            'tarifa_consulta'   => 'nullable|numeric|min:0',
            'moneda_tarifa'     => 'nullable|string|max:5',
            'educacion'         => 'nullable|array',
            'certificaciones'   => 'nullable|array',
            'idiomas'           => 'nullable|array',
        ];
    }

    public function store(Request $request) {
        $data = $request->validate(array_merge([
            'nombre'       => 'required|string|max:100',
            'apellido'     => 'required|string|max:100',
            'especialidad' => 'nullable|string|max:100',
            'telefono'     => 'nullable|string|max:50',
            'email'        => 'nullable|email',
            'activo'       => 'nullable|boolean',
        ], $this->camposProfesionales()));
        return response()->json(Medico::create($data), 201);
    }

    public function show(Medico $medico) {
        return $medico->load('citas');
    }

    public function update(Request $request, Medico $medico) {
        $data = $request->validate(array_merge([
            'nombre'       => 'sometimes|string|max:100',
            'apellido'     => 'sometimes|string|max:100',
            'especialidad' => 'nullable|string|max:100',
            'telefono'     => 'nullable|string|max:50',
            'email'        => 'nullable|email',
            'activo'       => 'nullable|boolean',
        ], $this->camposProfesionales()));
        $medico->update($data);
        return response()->json($medico);
    }

    public function destroy(Medico $medico) {
        $medico->delete();
        return response()->json(['message' => 'Médico eliminado']);
    }
}
