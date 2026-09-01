<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transmision;
use Illuminate\Http\Request;

class TransmisionController extends Controller {
    public function index(Request $request) {
        $query = Transmision::orderBy('created_at', 'desc');
        if ($request->estado) $query->where('estado', $request->estado);
        return response()->json($query->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nombre'      => 'required|string|max:200',
            'mensaje'     => 'required|string',
            'fecha_envio' => 'nullable|date',
            'hora_envio'  => 'nullable|string',
            'estado'      => 'nullable|in:borrador,agendada,enviando,completada,cancelada',
        ]);
        return response()->json(Transmision::create($data), 201);
    }

    public function update(Request $request, Transmision $transmision) {
        $data = $request->validate([
            'nombre'       => 'sometimes|string|max:200',
            'mensaje'      => 'sometimes|string',
            'fecha_envio'  => 'nullable|date',
            'hora_envio'   => 'nullable|string',
            'destinatarios'=> 'nullable|integer',
            'enviados'     => 'nullable|integer',
            'entregados'   => 'nullable|integer',
            'leidos'       => 'nullable|integer',
            'estado'       => 'nullable|in:borrador,agendada,enviando,completada,cancelada',
        ]);
        $transmision->update($data);
        return response()->json($transmision);
    }

    public function destroy(Transmision $transmision) {
        $transmision->delete();
        return response()->json(['message' => 'Transmisión eliminada']);
    }
}
