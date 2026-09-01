<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use Illuminate\Http\Request;

class PacienteController extends Controller {
    public function index(Request $request) {
        $query = Paciente::query();

        if ($request->search) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('nombre', 'like', "%$s%")
                  ->orWhere('apellido', 'like', "%$s%")
                  ->orWhere('telefono', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%");
            });
        }

        if ($request->estado) $query->where('estado', $request->estado);
        if ($request->fuente) $query->where('fuente', $request->fuente);

        return $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nombre'          => 'required|string|max:100',
            'apellido'        => 'nullable|string|max:100',
            'telefono'        => 'required|string|unique:pacientes',
            'whatsapp'        => 'nullable|string',
            'email'           => 'nullable|email',
            'fecha_nacimiento'=> 'nullable|date',
            'genero'          => 'nullable|in:masculino,femenino,otro',
            'ciudad'          => 'nullable|string',
            'pais'            => 'nullable|string',
            'notas'           => 'nullable|string',
            'estado'          => 'nullable|in:activo,inactivo,potencial',
            'fuente'          => 'nullable|string',
        ]);
        return response()->json(Paciente::create($data), 201);
    }

    public function show(Paciente $paciente) {
        return $paciente->load(['citas.procedimiento', 'conversaciones', 'pagos']);
    }

    public function update(Request $request, Paciente $paciente) {
        $data = $request->validate([
            'nombre'          => 'sometimes|string|max:100',
            'apellido'        => 'sometimes|string|max:100',
            'telefono'        => 'sometimes|string|unique:pacientes,telefono,'.$paciente->id,
            'whatsapp'        => 'nullable|string',
            'email'           => 'nullable|email',
            'fecha_nacimiento'=> 'nullable|date',
            'genero'          => 'nullable|in:masculino,femenino,otro',
            'ciudad'          => 'nullable|string',
            'pais'            => 'nullable|string',
            'notas'           => 'nullable|string',
            'estado'          => 'nullable|in:activo,inactivo,potencial',
            'fuente'          => 'nullable|string',
        ]);
        $paciente->update($data);
        return response()->json($paciente);
    }

    public function destroy(Paciente $paciente) {
        $paciente->delete();
        return response()->json(['message' => 'Paciente eliminado']);
    }
}
