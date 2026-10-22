<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarpetaFlujo;
use Illuminate\Http\Request;

class CarpetaFlujoController extends Controller {
    public function index() {
        return CarpetaFlujo::withCount('flujos')->orderBy('nombre')->get();
    }

    public function store(Request $request) {
        $data = $request->validate(['nombre' => 'required|string|max:100']);
        return response()->json(CarpetaFlujo::create($data)->loadCount('flujos'), 201);
    }

    public function update(Request $request, CarpetaFlujo $carpeta) {
        $data = $request->validate(['nombre' => 'required|string|max:100']);
        $carpeta->update($data);
        return response()->json($carpeta->loadCount('flujos'));
    }

    public function destroy(CarpetaFlujo $carpeta) {
        $carpeta->flujos()->update(['carpeta_id' => null]);
        $carpeta->delete();
        return response()->json(['message' => 'Carpeta eliminada']);
    }
}
