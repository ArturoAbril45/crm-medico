<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModeloMensaje;
use Illuminate\Http\Request;

class ModeloMensajeController extends Controller {
    public function index(Request $request) {
        $query = ModeloMensaje::orderBy('created_at', 'desc');
        if ($request->categoria && $request->categoria !== 'Todos') {
            $query->where('categoria', $request->categoria);
        }
        return response()->json($query->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nombre'    => 'required|string|max:200',
            'categoria' => 'required|in:Marketing,Utilidad,Servicio',
            'contenido' => 'required|string',
            'estado'    => 'nullable|in:pendiente,aprobado,rechazado',
        ]);
        return response()->json(ModeloMensaje::create($data), 201);
    }

    public function update(Request $request, ModeloMensaje $modeloMensaje) {
        $data = $request->validate([
            'nombre'    => 'sometimes|string|max:200',
            'categoria' => 'sometimes|in:Marketing,Utilidad,Servicio',
            'contenido' => 'sometimes|string',
            'estado'    => 'nullable|in:pendiente,aprobado,rechazado',
        ]);
        $modeloMensaje->update($data);
        return response()->json($modeloMensaje);
    }

    public function destroy(ModeloMensaje $modeloMensaje) {
        $modeloMensaje->delete();
        return response()->json(['message' => 'Modelo eliminado']);
    }
}
