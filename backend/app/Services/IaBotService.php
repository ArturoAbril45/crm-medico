<?php
namespace App\Services;

use App\Models\ConfiguracionIaBot;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Genera respuestas usando el proveedor de IA configurado globalmente
 * (Herramientas > WhatsApp AI Bot), para los nodos "asistente_gpt" del
 * editor visual de Flujos.
 */
class IaBotService {
    public function generarRespuesta(string $instruccionesNodo, float $temperatura, array $historial, string $mensajeUsuario): ?string {
        $config = ConfiguracionIaBot::first();
        if (!$config || !$config->activo || !$config->api_key) return null;

        $promptSistema = trim(($config->prompt_sistema ?? '') . "\n\n" . $instruccionesNodo);

        try {
            return match ($config->proveedor) {
                'anthropic' => $this->llamarAnthropic($config, $promptSistema, $temperatura, $historial, $mensajeUsuario),
                default => $this->llamarOpenAi($config, $promptSistema, $temperatura, $historial, $mensajeUsuario),
            };
        } catch (\Throwable $e) {
            Log::warning('IaBotService: fallo al generar respuesta', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function llamarOpenAi(ConfiguracionIaBot $config, string $promptSistema, float $temperatura, array $historial, string $mensajeUsuario): ?string {
        $mensajes = [['role' => 'system', 'content' => $promptSistema]];
        foreach ($historial as $m) $mensajes[] = $m;
        $mensajes[] = ['role' => 'user', 'content' => $mensajeUsuario];

        $resp = Http::withToken($config->api_key)
            ->timeout(20)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $config->modelo,
                'messages' => $mensajes,
                'temperature' => $temperatura,
            ]);

        if (!$resp->successful()) {
            Log::warning('IaBotService: OpenAI respondio con error', ['status' => $resp->status(), 'body' => $resp->body()]);
            return null;
        }

        return trim($resp->json('choices.0.message.content') ?? '') ?: null;
    }

    private function llamarAnthropic(ConfiguracionIaBot $config, string $promptSistema, float $temperatura, array $historial, string $mensajeUsuario): ?string {
        $mensajes = [];
        foreach ($historial as $m) $mensajes[] = $m;
        $mensajes[] = ['role' => 'user', 'content' => $mensajeUsuario];

        $resp = Http::withHeaders([
            'x-api-key' => $config->api_key,
            'anthropic-version' => '2023-06-01',
        ])
            ->timeout(20)
            ->post('https://api.anthropic.com/v1/messages', [
                'model' => $config->modelo,
                'system' => $promptSistema,
                'messages' => $mensajes,
                'max_tokens' => 1024,
                'temperature' => min($temperatura, 1.0),
            ]);

        if (!$resp->successful()) {
            Log::warning('IaBotService: Anthropic respondio con error', ['status' => $resp->status(), 'body' => $resp->body()]);
            return null;
        }

        return trim($resp->json('content.0.text') ?? '') ?: null;
    }
}
