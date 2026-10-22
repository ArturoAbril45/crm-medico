<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Paciente, Cita, Pago, Conversacion, Automatizacion, Flujo, Mensaje, Medico};
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller {
    public function index() {
        $hoy = Carbon::today();
        $inicioMes = Carbon::now()->startOfMonth();
        $mesAnterior = Carbon::now()->subMonth()->startOfMonth();

        $totalPacientes = Paciente::count();
        $pacientesMes = Paciente::where('created_at', '>=', $inicioMes)->count();
        $pacientesMesAnterior = Paciente::whereBetween('created_at', [$mesAnterior, $inicioMes])->count();

        $citasHoy = Cita::whereDate('fecha_hora', $hoy)->count();
        $citasMes = Cita::where('fecha_hora', '>=', $inicioMes)->count();
        $citasPendientes = Cita::where('estado', 'pendiente')->count();
        $citasConfirmadas = Cita::where('estado', 'confirmada')->count();

        $ingresosMes = Pago::where('estado', 'completado')
            ->where('fecha', '>=', $inicioMes)->sum('monto');
        $ingresosMesAnterior = Pago::where('estado', 'completado')
            ->whereBetween('fecha', [$mesAnterior, $inicioMes])->sum('monto');

        $conversacionesActivas = Conversacion::where('estado', 'abierta')->count();
        $ejecucionesAutomatizacion = Automatizacion::sum('ejecuciones');

        // Gestion de chat / rendimiento del equipo (para el panel de inicio estilo bandeja)
        $asignaciones = Conversacion::whereNotNull('agente_id')->where('created_at', '>=', $inicioMes)->count();
        $chatsCerrados = Conversacion::where('estado', 'cerrada')->where('updated_at', '>=', $inicioMes)->count();
        $primerasRespuestas = Mensaje::where('tipo', 'saliente')->where('created_at', '>=', $inicioMes)->distinct()->count('conversacion_id');
        $totalChats = Conversacion::where('created_at', '>=', $inicioMes)->count();

        $actividadPorDia = collect(range(6, 0))->map(function ($i) {
            $dia = Carbon::today()->subDays($i);
            return [
                'fecha' => $dia->toDateString(),
                'asignados' => Conversacion::whereDate('created_at', $dia)->whereNotNull('agente_id')->count(),
                'contestados' => Mensaje::where('tipo', 'saliente')->whereDate('created_at', $dia)->distinct()->count('conversacion_id'),
                'cerrados' => Conversacion::where('estado', 'cerrada')->whereDate('updated_at', $dia)->count(),
            ];
        })->values();

        $porMiembro = Conversacion::selectRaw('agente_id, count(*) as total')
            ->whereNotNull('agente_id')
            ->where('created_at', '>=', $inicioMes)
            ->groupBy('agente_id')
            ->with('agente:id,name')
            ->get();

        // Citas por día (últimos 7 días)
        $citasPorDia = Cita::select(DB::raw('DATE(fecha_hora) as fecha'), DB::raw('count(*) as total'))
            ->where('fecha_hora', '>=', Carbon::now()->subDays(7))
            ->groupBy('fecha')->orderBy('fecha')->get();

        // Próximas citas del día
        $proximasCitas = Cita::with(['paciente', 'procedimiento', 'medico'])
            ->whereDate('fecha_hora', $hoy)
            ->where('estado', '!=', 'cancelada')
            ->orderBy('fecha_hora')
            ->take(5)->get();

        // Estado de citas del mes
        $estadoCitas = Cita::where('fecha_hora', '>=', $inicioMes)
            ->select('estado', DB::raw('count(*) as total'))
            ->groupBy('estado')->get();

        $pacientesActivos = Paciente::where('estado', 'activo')->count();
        $pacientesRecientes = Paciente::orderBy('created_at', 'desc')->take(5)->get();

        // Panel clinico: medicos, pacientes con reserva, citas por medico
        $totalMedicos = Medico::count();
        $medicosActivos = Medico::where('activo', true)->count();
        $pacientesReservados = Paciente::has('citas')->count();
        $citasPorMedico = Cita::whereNotNull('medico_id')
            ->select('medico_id', DB::raw('count(*) as total'))
            ->groupBy('medico_id')
            ->with('medico:id,nombre,apellido,especialidad')
            ->orderByDesc('total')
            ->get();
        $citasSinMedico = Cita::whereNull('medico_id')->count();
        $medicosConGoogle = Medico::whereNotNull('google_refresh_token')->count();
        $pacientesSinReserva = $totalPacientes - $pacientesReservados;

        // Citas por especialidad (del medico asignado), este mes
        $citasPorEspecialidad = Cita::whereNotNull('medico_id')
            ->where('fecha_hora', '>=', $inicioMes)
            ->join('medicos', 'medicos.id', '=', 'citas.medico_id')
            ->whereNotNull('medicos.especialidad')->where('medicos.especialidad', '!=', '')
            ->select('medicos.especialidad', DB::raw('count(*) as total'))
            ->groupBy('medicos.especialidad')
            ->orderByDesc('total')
            ->get();

        // Distribucion de citas por hora del dia (todas, para ver horas pico)
        $citasPorHora = Cita::select(DB::raw('HOUR(fecha_hora) as hora'), DB::raw('count(*) as total'))
            ->groupBy('hora')->orderBy('hora')->get();

        // Tasa de asistencia: realizada vs no_asistio vs cancelada, este mes
        $realizadas = Cita::where('fecha_hora', '>=', $inicioMes)->where('estado', 'realizada')->count();
        $noAsistio = Cita::where('fecha_hora', '>=', $inicioMes)->where('estado', 'no_asistio')->count();
        $canceladas = Cita::where('fecha_hora', '>=', $inicioMes)->where('estado', 'cancelada')->count();
        $baseTasa = $realizadas + $noAsistio + $canceladas;
        $tasaAsistencia = $baseTasa > 0 ? round(($realizadas / $baseTasa) * 100) : null;

        return response()->json([
            'pacientes' => [
                'total' => $totalPacientes,
                'activos' => $pacientesActivos,
                'este_mes' => $pacientesMes,
                'crecimiento' => $pacientesMesAnterior > 0 ? round((($pacientesMes - $pacientesMesAnterior) / $pacientesMesAnterior) * 100) : 0,
                'recientes' => $pacientesRecientes,
            ],
            'citas' => [
                'hoy' => $citasHoy,
                'este_mes' => $citasMes,
                'pendientes' => $citasPendientes,
                'confirmadas' => $citasConfirmadas,
                'por_dia' => $citasPorDia,
                'estado' => $estadoCitas,
            ],
            'ingresos' => [
                'este_mes' => $ingresosMes,
                'mes_anterior' => $ingresosMesAnterior,
                'crecimiento' => $ingresosMesAnterior > 0 ? round((($ingresosMes - $ingresosMesAnterior) / $ingresosMesAnterior) * 100) : 0,
            ],
            'conversaciones' => [
                'activas' => $conversacionesActivas,
                'automatizaciones_ejecuciones' => $ejecucionesAutomatizacion,
            ],
            'chat' => [
                'total' => $totalChats,
                'asignaciones' => $asignaciones,
                'primeras_respuestas' => $primerasRespuestas,
                'chats_cerrados' => $chatsCerrados,
                'actividad_por_dia' => $actividadPorDia,
                'por_miembro' => $porMiembro,
            ],
            'clinica' => [
                'medicos_total' => $totalMedicos,
                'medicos_activos' => $medicosActivos,
                'medicos_con_google' => $medicosConGoogle,
                'pacientes_reservados' => $pacientesReservados,
                'pacientes_sin_reserva' => $pacientesSinReserva,
                'citas_total' => $citasMes,
                'citas_sin_medico' => $citasSinMedico,
                'citas_por_medico' => $citasPorMedico,
                'citas_por_especialidad' => $citasPorEspecialidad,
                'citas_por_hora' => $citasPorHora,
                'tasa_asistencia' => $tasaAsistencia,
                'realizadas' => $realizadas,
                'no_asistio' => $noAsistio,
                'canceladas' => $canceladas,
            ],
            'proximas_citas' => $proximasCitas,
        ]);
    }
}
