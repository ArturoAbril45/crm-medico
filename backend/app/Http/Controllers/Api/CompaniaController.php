<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compania;
use App\Services\WhatsappClient;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CompaniaController extends Controller {
    public function __construct(private WhatsappClient $whatsapp) {}

    private function requiereSuperAdmin(Request $request) {
        if (!$request->user()->es_super_admin) {
            abort(response()->json(['message' => 'No autorizado'], 403));
        }
    }

    public function index(Request $request) {
        $this->requiereSuperAdmin($request);

        $companias = Compania::withCount('usuarios')->orderBy('nombre')->get();
        $estados = $this->whatsapp->estadoTodas();

        return $companias->map(function ($c) use ($estados) {
            $estado = $estados[(string) $c->id] ?? $estados[$c->id] ?? null;
            return [
                'id' => $c->id,
                'nombre' => $c->nombre,
                'slug' => $c->slug,
                'activo' => $c->activo,
                'plan' => $c->plan,
                'usuarios_count' => $c->usuarios_count,
                'whatsapp_conectado' => ($estado['status'] ?? null) === 'conectado',
                'whatsapp_telefono' => $estado['telefono'] ?? $c->whatsapp_telefono,
            ];
        });
    }

    public function store(Request $request) {
        $this->requiereSuperAdmin($request);

        $data = $request->validate([
            'nombre' => 'required|string|max:150',
            'plan' => 'nullable|string|max:60',
        ]);

        $slugBase = Str::slug($data['nombre']);
        $slug = $slugBase;
        $i = 1;
        while (Compania::where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . (++$i);
        }

        $compania = Compania::create([...$data, 'slug' => $slug]);
        return response()->json($compania, 201);
    }

    public function update(Request $request, Compania $compania) {
        $this->requiereSuperAdmin($request);

        $compania->update($request->validate([
            'nombre' => 'sometimes|string|max:150',
            'plan' => 'nullable|string|max:60',
            'activo' => 'sometimes|boolean',
        ]));
        return response()->json($compania);
    }
}
