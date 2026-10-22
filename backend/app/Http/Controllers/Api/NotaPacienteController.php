<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotaPaciente;
use App\Models\Paciente;
use Illuminate\Http\Request;

class NotaPacienteController extends Controller {
    public function index(Paciente $paciente) {
        return $paciente->notasPaciente()->with('usuario:id,name')->get();
    }

    public function store(Request $request, Paciente $paciente) {
        $data = $request->validate(['texto' => 'required|string|max:2000']);
        $nota = NotaPaciente::create([
            'paciente_id' => $paciente->id,
            'usuario_id' => $request->user()->id,
            'texto' => $data['texto'],
        ]);
        return response()->json($nota->load('usuario:id,name'), 201);
    }
}
