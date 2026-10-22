<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HorarioMedico;
use Illuminate\Http\Request;

class HorarioMedicoController extends Controller {
    public function index(Request $request) {
        $query = HorarioMedico::with('medico');
        if ($request->medico_id) $query->where('medico_id', $request->medico_id);
        return $query->orderBy('hora_inicio')->get();
    }

    private function reglas(): array {
        return [
            'medico_id'         => 'required|exists:medicos,id',
            'rango_aplicacion'  => 'required|in:indefinido,recurrente,un_dia,una_semana,mes',
            'dias_semana'       => 'nullable|array',
            'dias_semana.*'     => 'integer|min:0|max:6',
            'valido_desde'      => 'nullable|date',
            'valido_hasta'      => 'nullable|date',
            'hora_inicio'       => 'required',
            'hora_fin'          => 'required',
            'tipo_consulta'     => 'required|in:hibrido,presencial,telemedicina',
            'duracion_turno'    => 'nullable|integer|min:5',
            'requiere_coseguro' => 'nullable|boolean',
            'monto_coseguro'    => 'nullable|numeric|min:0',
        ];
    }

    public function store(Request $request) {
        $data = $request->validate($this->reglas());
        return response()->json(HorarioMedico::create($data)->load('medico'), 201);
    }

    public function update(Request $request, HorarioMedico $horario_medico) {
        $data = $request->validate($this->reglas());
        $horario_medico->update($data);
        return response()->json($horario_medico->load('medico'));
    }

    public function destroy(HorarioMedico $horario_medico) {
        $horario_medico->delete();
        return response()->json(['message' => 'Horario eliminado']);
    }
}
