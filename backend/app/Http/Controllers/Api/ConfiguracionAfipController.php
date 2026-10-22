<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracionAfip;
use Illuminate\Http\Request;

class ConfiguracionAfipController extends Controller {
    public function show() {
        $config = ConfiguracionAfip::first();
        if (!$config) $config = ConfiguracionAfip::create([]);
        return response()->json($config);
    }

    public function update(Request $request) {
        $data = $request->validate([
            'cuit' => 'nullable|string|max:15',
            'razon_social' => 'nullable|string|max:150',
            'punto_venta' => 'nullable|integer|min:1',
            'condicion_iva' => 'nullable|in:responsable_inscripto,monotributo,exento,consumidor_final',
            'ambiente' => 'nullable|in:testing,produccion',
            'activo' => 'nullable|boolean',
        ]);
        $config = ConfiguracionAfip::first() ?? ConfiguracionAfip::create([]);
        $config->update($data);
        return response()->json($config);
    }
}
