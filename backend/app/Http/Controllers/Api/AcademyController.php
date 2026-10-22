<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublicacionAcademy;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AcademyController extends Controller {
    public function index(Request $request) {
        $query = PublicacionAcademy::query();
        $query->where('estado', $request->estado === 'pendiente' ? 'pendiente' : 'publicado');
        if ($request->modulo) $query->where('modulo', $request->modulo);
        if ($request->tipo) $query->where('tipo', $request->tipo);
        return $query->orderByDesc('created_at')->get();
    }

    public function show(string $slug) {
        return PublicacionAcademy::where('slug', $slug)->firstOrFail();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'titulo' => 'required|string|max:200',
            'resumen' => 'nullable|string|max:400',
            'contenido' => 'required|string',
            'modulo' => 'nullable|string|max:100',
        ]);

        $slugBase = Str::slug($data['titulo']);
        $slug = $slugBase;
        $i = 1;
        while (PublicacionAcademy::where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . (++$i);
        }

        $publicacion = PublicacionAcademy::create([
            ...$data,
            'slug' => $slug,
            'tipo' => 'comunidad',
            'estado' => 'pendiente',
            'autor_nombre' => $request->user()->name,
            'minutos_lectura' => max(1, (int) round(str_word_count(strip_tags($data['contenido'])) / 200)),
        ]);

        return response()->json($publicacion, 201);
    }

    public function votar(Request $request, PublicacionAcademy $publicacion) {
        $data = $request->validate(['util' => 'required|boolean']);
        $publicacion->increment($data['util'] ? 'votos_util' : 'votos_no_util');
        return response()->json($publicacion);
    }

    public function moderar(Request $request, PublicacionAcademy $publicacion) {
        $data = $request->validate(['estado' => 'required|in:publicado,rechazado']);
        $publicacion->update(['estado' => $data['estado']]);
        return response()->json($publicacion);
    }
}
