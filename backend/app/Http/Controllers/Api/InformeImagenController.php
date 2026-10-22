<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InformeImagen;
use Illuminate\Http\Request;

class InformeImagenController extends Controller {
    public function index(Request $request) {
        $query = InformeImagen::with(['paciente', 'medico']);

        if ($request->desde) $query->whereDate('fecha', '>=', $request->desde);
        if ($request->hasta) $query->whereDate('fecha', '<=', $request->hasta);
        if ($request->estado) $query->where('estado', $request->estado);

        $informes = $query->orderByDesc('fecha')->get();

        $todos = InformeImagen::query();
        if ($request->desde) $todos->whereDate('fecha', '>=', $request->desde);
        if ($request->hasta) $todos->whereDate('fecha', '<=', $request->hasta);
        $conteos = (clone $todos)->selectRaw('estado, count(*) as total')->groupBy('estado')->pluck('total', 'estado');

        return response()->json([
            'informes' => $informes,
            'pendientes' => $conteos['pendiente'] ?? 0,
            'borradores' => $conteos['borrador'] ?? 0,
            'preliminares' => $conteos['preliminar'] ?? 0,
            'firmados' => $conteos['firmado'] ?? 0,
        ]);
    }

    private function reglas(): array {
        return [
            'paciente_id' => 'required|exists:pacientes,id',
            'medico_id' => 'nullable|exists:medicos,id',
            'tipo_estudio' => 'required|string|max:150',
            'estado' => 'nullable|in:pendiente,borrador,preliminar,firmado',
            'contenido' => 'nullable|string',
            'fecha' => 'required|date',
        ];
    }

    public function store(Request $request) {
        return response()->json(InformeImagen::create($request->validate($this->reglas()))->load(['paciente', 'medico']), 201);
    }

    public function update(Request $request, InformeImagen $informe) {
        $informe->update($request->validate($this->reglas()));
        return response()->json($informe->load(['paciente', 'medico']));
    }

    public function destroy(InformeImagen $informe) {
        $informe->delete();
        return response()->json(['message' => 'Informe eliminado']);
    }
}
