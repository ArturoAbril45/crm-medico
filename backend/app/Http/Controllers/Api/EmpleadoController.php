<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use Illuminate\Http\Request;

class EmpleadoController extends Controller {
    public function index(Request $request) {
        $query = Empleado::query();

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nombre', 'like', "%$s%")
                  ->orWhere('apellido', 'like', "%$s%")
                  ->orWhere('cargo', 'like', "%$s%");
            });
        }
        if ($request->estado) $query->where('estado', $request->estado);

        return $query->orderBy('nombre')->get();
    }

    private function reglas(): array {
        return [
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'documento_identidad' => 'nullable|string|max:30',
            'cargo' => 'required|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'fecha_ingreso' => 'required|date',
            'fecha_egreso' => 'nullable|date',
            'salario' => 'nullable|numeric',
            'tipo_contrato' => 'required|in:planta_permanente,plazo_fijo,honorarios,pasante',
            'telefono' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:150',
            'estado' => 'nullable|in:activo,licencia,vacaciones,inactivo',
        ];
    }

    public function store(Request $request) {
        return response()->json(Empleado::create($request->validate($this->reglas())), 201);
    }

    public function update(Request $request, Empleado $empleado) {
        $reglas = collect($this->reglas())->map(fn($r) => 'sometimes|' . $r)->toArray();
        $empleado->update($request->validate($reglas));
        return response()->json($empleado);
    }

    public function destroy(Empleado $empleado) {
        $empleado->delete();
        return response()->json(['message' => 'Empleado eliminado']);
    }
}
