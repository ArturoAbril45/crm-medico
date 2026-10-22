<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\LicenciaEmpleado;
use Illuminate\Http\Request;

class LicenciaEmpleadoController extends Controller {
    public function index(Request $request) {
        $query = LicenciaEmpleado::with('empleado');
        if ($request->estado) $query->where('estado', $request->estado);
        return $query->orderByDesc('fecha_inicio')->get();
    }

    private function reglas(): array {
        return [
            'empleado_id' => 'required|exists:empleados,id',
            'tipo' => 'required|in:vacaciones,enfermedad,personal,maternidad_paternidad,otro',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'motivo' => 'nullable|string',
        ];
    }

    public function store(Request $request) {
        $licencia = LicenciaEmpleado::create($request->validate($this->reglas()));
        return response()->json($licencia->load('empleado'), 201);
    }

    public function update(Request $request, LicenciaEmpleado $licencia) {
        $data = $request->validate(['estado' => 'required|in:pendiente,aprobada,rechazada']);
        $licencia->update($data);

        if ($data['estado'] === 'aprobada') {
            $empleado = $licencia->empleado;
            $hoy = now()->toDateString();
            if ($licencia->fecha_inicio->toDateString() <= $hoy && $licencia->fecha_fin->toDateString() >= $hoy) {
                $empleado->update(['estado' => $licencia->tipo === 'vacaciones' ? 'vacaciones' : 'licencia']);
            }
        }

        return response()->json($licencia->load('empleado'));
    }

    public function destroy(LicenciaEmpleado $licencia) {
        $licencia->delete();
        return response()->json(['message' => 'Licencia eliminada']);
    }
}
