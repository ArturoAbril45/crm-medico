<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SalaEsperaController extends Controller {
    public function index() {
        $citas = Cita::with(['paciente', 'medico', 'procedimiento'])
            ->whereIn('estado', ['en_espera', 'en_progreso'])
            ->orderBy('hora_checkin')
            ->get();

        $esperando = $citas->where('estado', 'en_espera');
        $minutos = $esperando->map(fn ($c) => $c->hora_checkin ? $c->hora_checkin->diffInMinutes(now()) : 0);

        return response()->json([
            'pacientes' => $citas->map(fn ($c) => [
                'id' => $c->id,
                'paciente' => $c->paciente ? "{$c->paciente->nombre} {$c->paciente->apellido}" : '—',
                'medico' => $c->medico ? "Dr(a). {$c->medico->nombre} {$c->medico->apellido}" : ($c->doctor ?: '—'),
                'especialidad' => $c->medico->especialidad ?? ($c->procedimiento->categoria ?? '—'),
                'espera_minutos' => $c->hora_checkin ? $c->hora_checkin->diffInMinutes(now()) : 0,
                'estado' => $c->estado,
            ]),
            'en_espera' => $esperando->count(),
            'espera_promedio' => $minutos->count() ? round($minutos->avg()) : 0,
            'espera_maxima' => $minutos->count() ? $minutos->max() : 0,
        ]);
    }

    public function monitorTv() {
        $hoy = Carbon::today();

        $llamando = Cita::with(['paciente', 'medico'])
            ->where('estado', 'en_progreso')
            ->latest('updated_at')
            ->first();

        $atendidos = Cita::with(['paciente', 'medico'])
            ->where('estado', 'realizada')
            ->whereDate('updated_at', $hoy)
            ->latest('updated_at')
            ->limit(8)
            ->get();

        $esperando = Cita::where('estado', 'en_espera')->get();
        $minutos = $esperando->map(fn ($c) => $c->hora_checkin ? $c->hora_checkin->diffInMinutes(now()) : 0);

        return response()->json([
            'llamando' => $llamando ? [
                'paciente' => $llamando->paciente ? "{$llamando->paciente->nombre} {$llamando->paciente->apellido}" : '—',
                'medico' => $llamando->medico ? "Dr(a). {$llamando->medico->nombre} {$llamando->medico->apellido}" : ($llamando->doctor ?: '—'),
            ] : null,
            'atendidos' => $atendidos->map(fn ($c) => [
                'paciente' => $c->paciente ? "{$c->paciente->nombre} {$c->paciente->apellido}" : '—',
                'medico' => $c->medico ? "Dr(a). {$c->medico->nombre} {$c->medico->apellido}" : ($c->doctor ?: '—'),
            ]),
            'espera_promedio' => $minutos->count() ? round($minutos->avg()) : 0,
        ]);
    }

    public function checkin(Cita $cita) {
        $cita->update(['estado' => 'en_espera', 'hora_checkin' => Carbon::now()]);
        return response()->json($cita->load(['paciente', 'medico']));
    }

    public function atender(Cita $cita) {
        $cita->update(['estado' => 'en_progreso']);
        return response()->json($cita->load(['paciente', 'medico']));
    }

    public function completar(Cita $cita) {
        $cita->update(['estado' => 'realizada']);
        return response()->json($cita->load(['paciente', 'medico']));
    }
}
