<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prestacion;
use Illuminate\Http\Request;

class PrestacionController extends Controller {
    public function index(Request $request) {
        $query = Prestacion::query();
        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('codigo', 'like', "%$s%")->orWhere('descripcion', 'like', "%$s%");
            });
        }
        return $query->orderBy('codigo')->get();
    }

    private function reglas(): array {
        return [
            'codigo' => 'required|string|max:50',
            'descripcion' => 'required|string|max:200',
            'categoria' => 'nullable|string|max:100',
            'tipo' => 'nullable|string|max:100',
            'valor_base' => 'nullable|numeric',
        ];
    }

    public function store(Request $request) {
        return response()->json(Prestacion::create($request->validate($this->reglas())), 201);
    }

    public function update(Request $request, Prestacion $prestacion) {
        $prestacion->update($request->validate($this->reglas()));
        return response()->json($prestacion);
    }

    public function destroy(Prestacion $prestacion) {
        $prestacion->delete();
        return response()->json(['message' => 'Prestación eliminada']);
    }
}
