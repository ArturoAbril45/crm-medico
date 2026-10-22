<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Flujo, Bloque, BloqueEdge};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FlujoController extends Controller {
    public function index() {
        return Flujo::withCount('bloques')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request) {
        $data = $request->validate(['nombre' => 'required|string', 'descripcion' => 'nullable|string']);
        $flujo = Flujo::create($data);

        // Crear bloque inicial automáticamente
        Bloque::create([
            'flujo_id' => $flujo->id,
            'client_id' => (string) Str::uuid(),
            'tipo' => 'inicio',
            'pos_x' => 50, 'pos_y' => 300,
            'config' => ['titulo' => 'Inicio del flujo'],
        ]);
        return response()->json($flujo->load('bloques', 'edges'), 201);
    }

    public function show(Flujo $flujo) {
        return $flujo->load('bloques', 'edges');
    }

    public function update(Request $request, Flujo $flujo) {
        $flujo->update($request->validate([
            'nombre' => 'sometimes|string',
            'descripcion' => 'nullable|string',
            'activo' => 'sometimes|boolean',
            'carpeta_id' => 'sometimes|nullable|exists:carpetas_flujo,id',
        ]));
        return response()->json($flujo);
    }

    public function destroy(Flujo $flujo) {
        $flujo->delete();
        return response()->json(['message' => 'Flujo eliminado']);
    }

    public function guardarFlujo(Request $request, Flujo $flujo) {
        $data = $request->validate([
            'bloques' => 'required|array',
            'bloques.*.client_id' => 'required|string',
            'bloques.*.tipo' => 'required|string',
            'bloques.*.pos_x' => 'required|numeric',
            'bloques.*.pos_y' => 'required|numeric',
            'bloques.*.config' => 'nullable|array',
            'edges' => 'nullable|array',
            'edges.*.from_client_id' => 'required|string',
            'edges.*.to_client_id' => 'required|string',
            'edges.*.from_handle' => 'nullable|string',
            'edges.*.label' => 'nullable|string',
        ]);

        DB::transaction(function () use ($data, $flujo) {
            $flujo->bloques()->delete();
            $flujo->edges()->delete();

            foreach ($data['bloques'] as $b) {
                Bloque::create([
                    'flujo_id' => $flujo->id,
                    'client_id' => $b['client_id'],
                    'tipo' => $b['tipo'],
                    'pos_x' => $b['pos_x'],
                    'pos_y' => $b['pos_y'],
                    'config' => $b['config'] ?? null,
                ]);
            }
            foreach ($data['edges'] ?? [] as $e) {
                BloqueEdge::create([
                    'flujo_id' => $flujo->id,
                    'from_client_id' => $e['from_client_id'],
                    'to_client_id' => $e['to_client_id'],
                    'from_handle' => $e['from_handle'] ?? null,
                    'label' => $e['label'] ?? null,
                ]);
            }
        });

        return response()->json(['message' => 'Flujo guardado', 'flujo' => $flujo->load('bloques', 'edges')]);
    }

    // --- Editor de flujo (constructor): CRUD granular de bloques y conexiones ---

    public function crearBloque(Request $request, Flujo $flujo) {
        $data = $request->validate([
            'tipo' => 'required|in:inicio,contenido,menu,condicion,accion',
            'pos_x' => 'required|numeric',
            'pos_y' => 'required|numeric',
            'config' => 'nullable|array',
        ]);

        $bloque = Bloque::create([
            'flujo_id' => $flujo->id,
            'tipo' => $data['tipo'],
            'pos_x' => $data['pos_x'],
            'pos_y' => $data['pos_y'],
            'config' => $data['config'] ?? ['titulo' => ucfirst($data['tipo'])],
        ]);

        return response()->json($bloque);
    }

    public function actualizarBloque(Request $request, Bloque $bloque) {
        $data = $request->validate([
            'config' => 'sometimes|array',
        ]);
        $bloque->update($data);
        return response()->json($bloque);
    }

    public function moverBloque(Request $request, Bloque $bloque) {
        $data = $request->validate([
            'pos_x' => 'required|numeric',
            'pos_y' => 'required|numeric',
        ]);
        $bloque->update($data);
        return response()->json($bloque);
    }

    public function eliminarBloque(Bloque $bloque) {
        $bloque->delete();
        return response()->json(['message' => 'Bloque eliminado']);
    }

    public function crearConexion(Request $request) {
        $data = $request->validate([
            'bloque_origen_id' => 'required|exists:bloques,id',
            'bloque_destino_id' => 'required|exists:bloques,id',
            'valor' => 'nullable|string',
            'etiqueta' => 'nullable|string',
        ]);
        $conexion = BloqueConexion::create($data);
        return response()->json($conexion);
    }

    public function eliminarConexion(BloqueConexion $conexion) {
        $conexion->delete();
        return response()->json(['message' => 'Conexión eliminada']);
    }
}
