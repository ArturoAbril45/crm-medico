<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Models\PacienteArchivo;
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
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('numero_documento', 'like', "%$s%");
            });
        }

        if ($request->estado) $query->where('estado', $request->estado);
        if ($request->fuente) $query->where('fuente', $request->fuente);
        if ($request->boolean('con_citas')) {
            $query->has('citas')->with(['citas' => function ($q) {
                $q->with('medico')->orderBy('fecha_hora', 'desc');
            }]);
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);
    }

    public function actualizarEtiquetas(Request $request, Paciente $paciente) {
        $data = $request->validate(['etiquetas' => 'required|array', 'etiquetas.*' => 'string|max:40']);
        $paciente->update(['etiquetas' => $data['etiquetas']]);
        return response()->json($paciente);
    }

    private function camposMedicos(): array {
        return [
            'segundo_nombre'        => 'nullable|string|max:100',
            'telefono_fijo'         => 'nullable|string',
            'tipo_documento'        => 'nullable|in:dni,pasaporte,cedula,otro',
            'numero_documento'      => 'nullable|string|max:50',
            'pais_emisor_documento' => 'nullable|string|max:100',
            'direccion_linea1'      => 'nullable|string|max:150',
            'direccion_linea2'      => 'nullable|string|max:150',
            'provincia'             => 'nullable|string|max:100',
            'codigo_postal'         => 'nullable|string|max:20',
            'tipo_sangre'           => 'nullable|in:A,B,AB,O',
            'factor_rh'             => 'nullable|in:positivo,negativo,desconocido',
            'altura_cm'             => 'nullable|integer|min:0|max:300',
            'peso_kg'               => 'nullable|numeric|min:0|max:500',
            'emergencia_nombre'     => 'nullable|string|max:150',
            'emergencia_telefono'   => 'nullable|string|max:50',
            'emergencia_relacion'   => 'nullable|in:esposo_a,padre_madre,hijo_a,hermano_a,otro_familiar,amigo_a,otro',
            'tipo_cobertura'        => 'nullable|in:privado,obra_social,prepaga,particular',
            'consentimiento_red'    => 'nullable|boolean',
        ];
    }

    public function store(Request $request) {
        $data = $request->validate(array_merge([
            'nombre'          => 'required|string|max:100',
            'segundo_nombre'  => 'nullable|string|max:100',
            'apellido'        => 'nullable|string|max:100',
            'telefono'        => 'required|string|unique:pacientes',
            'telefono_fijo'   => 'nullable|string',
            'whatsapp'        => 'nullable|string',
            'email'           => 'nullable|email',
            'fecha_nacimiento'=> 'nullable|date',
            'genero'          => 'nullable|in:masculino,femenino,otro',
            'tipo_sangre'     => 'nullable|string',
            'tipo_documento'  => 'nullable|string',
            'numero_documento'=> 'nullable|string',
            'pais_documento'  => 'nullable|string',
            'ciudad'          => 'nullable|string',
            'pais'            => 'nullable|string',
            'notas'           => 'nullable|string',
            'estado'          => 'nullable|in:activo,inactivo,potencial',
            'fuente'          => 'nullable|string',
        ], $this->camposMedicos()));
        return response()->json(Paciente::create($data), 201);
    }

    public function show(Paciente $paciente) {
        return $paciente->load(['citas.procedimiento', 'conversaciones', 'pagos', 'archivos']);
    }

    public function update(Request $request, Paciente $paciente) {
        $data = $request->validate(array_merge([
            'nombre'          => 'sometimes|string|max:100',
            'segundo_nombre'  => 'nullable|string|max:100',
            'apellido'        => 'sometimes|string|max:100',
            'telefono'        => 'sometimes|string|unique:pacientes,telefono,'.$paciente->id,
            'telefono_fijo'   => 'nullable|string',
            'whatsapp'        => 'nullable|string',
            'email'           => 'nullable|email',
            'fecha_nacimiento'=> 'nullable|date',
            'genero'          => 'nullable|in:masculino,femenino,otro',
            'tipo_sangre'     => 'nullable|string',
            'tipo_documento'  => 'nullable|string',
            'numero_documento'=> 'nullable|string',
            'pais_documento'  => 'nullable|string',
            'ciudad'          => 'nullable|string',
            'pais'            => 'nullable|string',
            'notas'           => 'nullable|string',
            'estado'          => 'nullable|in:activo,inactivo,potencial',
            'fuente'          => 'nullable|string',
        ], $this->camposMedicos()));
        $paciente->update($data);
        return response()->json($paciente->load(['citas' => function ($q) { $q->with('medico')->orderBy('fecha_hora', 'desc'); }]));
    }

    public function destroy(Paciente $paciente) {
        $paciente->delete();
        return response()->json(['message' => 'Paciente eliminado']);
    }

    public function subirArchivo(Request $request, Paciente $paciente) {
        $request->validate([
            'archivo' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);
        $file = $request->file('archivo');
        $ruta = $file->store("pacientes/{$paciente->id}/archivos", 'public');

        $archivo = $paciente->archivos()->create([
            'nombre_original' => $file->getClientOriginalName(),
            'ruta'            => $ruta,
            'tipo_mime'       => $file->getClientMimeType(),
            'tamano_bytes'    => $file->getSize(),
        ]);

        return response()->json($archivo, 201);
    }

    public function eliminarArchivo(Paciente $paciente, PacienteArchivo $archivo) {
        if ($archivo->paciente_id !== $paciente->id) {
            return response()->json(['message' => 'Archivo no pertenece a este paciente'], 403);
        }
        \Illuminate\Support\Facades\Storage::disk('public')->delete($archivo->ruta);
        $archivo->delete();
        return response()->json(['message' => 'Archivo eliminado']);
    }
}
