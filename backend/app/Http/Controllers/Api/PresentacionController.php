<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presentacion;
use App\Models\PracticaFacturable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PresentacionController extends Controller {
    public function index() {
        return Presentacion::with('convenio')->orderByDesc('periodo')->get();
    }

    public function generar(Request $request) {
        $data = $request->validate([
            'convenio_id' => 'required|exists:convenios,id',
            'periodo' => 'required|string|max:7',
        ]);

        $practicas = PracticaFacturable::where('convenio_id', $data['convenio_id'])
            ->where('estado', 'lista')
            ->whereRaw("DATE_FORMAT(fecha, '%Y-%m') = ?", [$data['periodo']])
            ->get();

        if ($practicas->isEmpty()) {
            return response()->json(['message' => 'No hay prácticas en estado "Lista" para ese convenio y período'], 422);
        }

        return DB::transaction(function () use ($data, $practicas) {
            $presentacion = Presentacion::create([
                'convenio_id' => $data['convenio_id'],
                'periodo' => $data['periodo'],
                'presentado_en' => now(),
                'liquidacion' => $practicas->sum('monto'),
                'status' => 'presentada',
            ]);

            PracticaFacturable::whereIn('id', $practicas->pluck('id'))
                ->update(['estado' => 'presentada', 'presentacion_id' => $presentacion->id]);

            return response()->json($presentacion->load('convenio'), 201);
        });
    }

    public function destroy(Presentacion $presentacion) {
        $presentacion->practicas()->update(['estado' => 'lista', 'presentacion_id' => null]);
        $presentacion->delete();
        return response()->json(['message' => 'Presentación eliminada']);
    }
}
