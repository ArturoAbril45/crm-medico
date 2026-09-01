<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Paciente, Cita, Pago, Conversacion, Automatizacion, Flujo};
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

        // Citas por día (últimos 7 días)
        $citasPorDia = Cita::select(DB::raw('DATE(fecha_hora) as fecha'), DB::raw('count(*) as total'))
            ->where('fecha_hora', '>=', Carbon::now()->subDays(7))
            ->groupBy('fecha')->orderBy('fecha')->get();

        // Próximas citas del día
        $proximasCitas = Cita::with(['paciente', 'procedimiento'])
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
            'proximas_citas' => $proximasCitas,
        ]);
    }
}
