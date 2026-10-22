<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medico;
use Illuminate\Http\Request;

class HonorarioController extends Controller {
    public function index(Request $request) {
        $periodo = $request->periodo ?? now()->format('Y-m');

        $medicos = Medico::where('activo', true)->orderBy('nombre')->get();

        return response()->json($medicos->map(function ($medico) use ($periodo) {
            $cobrado = $medico->practicasFacturables()
                ->where('estado', 'cobrada')
                ->whereRaw("DATE_FORMAT(fecha, '%Y-%m') = ?", [$periodo])
                ->sum('monto');
            $porcentaje = $medico->honorario_porcentaje ?? 0;

            return [
                'id' => $medico->id,
                'nombre' => $medico->nombre,
                'apellido' => $medico->apellido,
                'especialidad' => $medico->especialidad,
                'honorario_porcentaje' => $porcentaje,
                'total_cobrado' => $cobrado,
                'liquidacion' => round($cobrado * $porcentaje / 100, 2),
            ];
        }));
    }

    public function actualizarPorcentaje(Request $request, Medico $medico) {
        $data = $request->validate(['honorario_porcentaje' => 'required|numeric|min:0|max:100']);
        $medico->update($data);
        return response()->json(['message' => 'Porcentaje actualizado']);
    }
}
