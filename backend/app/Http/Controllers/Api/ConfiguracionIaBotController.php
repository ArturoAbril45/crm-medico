<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracionIaBot;
use Illuminate\Http\Request;

class ConfiguracionIaBotController extends Controller {
    public function show() {
        $config = ConfiguracionIaBot::first();
        if (!$config) $config = ConfiguracionIaBot::create([]);
        return response()->json([
            'id' => $config->id,
            'proveedor' => $config->proveedor,
            'modelo' => $config->modelo,
            'tiene_api_key' => !empty($config->api_key),
            'prompt_sistema' => $config->prompt_sistema,
            'temperatura_default' => $config->temperatura_default,
            'activo' => $config->activo,
        ]);
    }

    public function update(Request $request) {
        $data = $request->validate([
            'proveedor' => 'nullable|in:openai,anthropic',
            'modelo' => 'nullable|string|max:100',
            'api_key' => 'nullable|string',
            'prompt_sistema' => 'nullable|string',
            'temperatura_default' => 'nullable|numeric|min:0|max:2',
            'activo' => 'nullable|boolean',
        ]);
        // una api_key vacia/ausente en el payload no borra la ya guardada
        if (array_key_exists('api_key', $data) && $data['api_key'] === '') unset($data['api_key']);

        $config = ConfiguracionIaBot::first() ?? ConfiguracionIaBot::create([]);
        $config->update($data);

        return $this->show();
    }
}
