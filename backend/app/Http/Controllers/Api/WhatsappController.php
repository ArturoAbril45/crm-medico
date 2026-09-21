<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsappConversacion;
use App\Models\WhatsappMensaje;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WhatsappController extends Controller
{
    public function conversaciones()
    {
        return WhatsappConversacion::with('paciente')
            ->orderByRaw('ultimo_mensaje_at IS NULL, ultimo_mensaje_at DESC')
            ->get();
    }

    public function mensajes(WhatsappConversacion $conversacion)
    {
        $conversacion->update(['no_leidos' => 0]);
        return $conversacion->mensajes()->get();
    }

    public function enviar(Request $request)
    {
        $data = $request->validate([
            'conversacion_id' => 'required|exists:whatsapp_conversaciones,id',
            'texto' => 'nullable|string',
            'archivo' => 'nullable|file|max:20480',
        ]);
        if (empty($data['texto']) && !$request->hasFile('archivo')) {
            return response()->json(['ok' => false, 'error' => 'El mensaje necesita texto o un archivo adjunto.'], 422);
        }
        $conversacion = WhatsappConversacion::findOrFail($data['conversacion_id']);

        $tipo = 'texto';
        $archivoUrl = null;
        $archivoNombre = null;

        if ($request->hasFile('archivo')) {
            $file = $request->file('archivo');
            $mime = $file->getMimeType();
            $tipo = str_starts_with($mime, 'image/') ? 'imagen' : (str_starts_with($mime, 'audio/') ? 'audio' : 'documento');
            $path = $file->store('whatsapp', 'public');
            $archivoUrl = Storage::disk('public')->url($path);
            $archivoNombre = $file->getClientOriginalName();
        }

        $bot = config('services.whatsapp_bot');
        $respuesta = Http::withToken($bot['token'])
            ->timeout(20)
            ->post("{$bot['url']}/enviar", [
                'numero' => $conversacion->telefono,
                'mensaje' => $data['texto'] ?? '',
                'tipo' => $tipo,
                'archivo_url' => $archivoUrl,
                'archivo_nombre' => $archivoNombre,
            ]);

        if (!$respuesta->ok() || !($respuesta->json('ok'))) {
            return response()->json(['ok' => false, 'error' => $respuesta->json('error') ?? 'No se pudo enviar el mensaje.'], 422);
        }

        $mensaje = WhatsappMensaje::create([
            'conversacion_id' => $conversacion->id,
            'texto' => $data['texto'] ?? null,
            'de' => 'clinica',
            'tipo' => $tipo,
            'archivo_url' => $archivoUrl,
            'archivo_nombre' => $archivoNombre,
        ]);
        $conversacion->update(['ultimo_mensaje' => $data['texto'] ?? ucfirst($tipo), 'ultimo_mensaje_at' => now()]);

        return response()->json($mensaje, 201);
    }

    // Recibe los mensajes entrantes desde el bot de Baileys (index.js del bot medico).
    public function webhook(Request $request)
    {
        $bot = config('services.whatsapp_bot');
        if ($request->header('X-Bot-Token') !== $bot['token']) {
            return response()->json(['error' => 'Token inválido'], 403);
        }

        $data = $request->validate([
            'numero' => 'required|string',
            'nombre' => 'nullable|string',
            'mensaje' => 'nullable|string',
            'tipo' => 'nullable|in:texto,imagen,audio,documento',
            'archivo' => 'nullable|string',
            'archivo_nombre' => 'nullable|string',
        ]);

        $conversacion = WhatsappConversacion::firstOrCreate(
            ['telefono' => $data['numero']],
            ['nombre' => $data['nombre'] ?? null, 'estado' => 'activo']
        );
        if (!empty($data['nombre']) && $conversacion->nombre !== $data['nombre']) {
            $conversacion->nombre = $data['nombre'];
        }

        $tipo = $data['tipo'] ?? 'texto';
        $archivoUrl = null;
        $archivoNombre = $data['archivo_nombre'] ?? null;

        if (!empty($data['archivo']) && $tipo !== 'texto') {
            $extensiones = ['imagen' => 'jpg', 'audio' => 'ogg', 'documento' => 'bin'];
            $nombreArchivo = 'whatsapp/' . Str::random(20) . '.' . ($extensiones[$tipo] ?? 'bin');
            Storage::disk('public')->put($nombreArchivo, base64_decode($data['archivo']));
            $archivoUrl = Storage::disk('public')->url($nombreArchivo);
        }

        WhatsappMensaje::create([
            'conversacion_id' => $conversacion->id,
            'texto' => $data['mensaje'] ?? null,
            'de' => 'cliente',
            'tipo' => $tipo,
            'archivo_url' => $archivoUrl,
            'archivo_nombre' => $archivoNombre,
        ]);

        $etiquetas = ['imagen' => 'Imagen', 'audio' => 'Audio', 'documento' => 'Archivo'];
        $conversacion->ultimo_mensaje = $data['mensaje'] ?: ($etiquetas[$tipo] ?? 'Mensaje nuevo');
        $conversacion->ultimo_mensaje_at = now();
        $conversacion->no_leidos = $conversacion->no_leidos + 1;
        $conversacion->save();

        return response()->json(['ok' => true]);
    }

    public function estado()
    {
        $bot = config('services.whatsapp_bot');
        try {
            $respuesta = Http::withToken($bot['token'])->timeout(10)->get("{$bot['url']}/estado");
            return $respuesta->json();
        } catch (\Throwable $e) {
            return response()->json(['conectado' => false, 'qr' => null, 'error' => 'No se pudo contactar al bot: ' . $e->getMessage()]);
        }
    }

    public function conectar()
    {
        $bot = config('services.whatsapp_bot');
        try {
            $respuesta = Http::withToken($bot['token'])->timeout(15)->post("{$bot['url']}/conectar");
            return $respuesta->json();
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function desconectar()
    {
        $bot = config('services.whatsapp_bot');
        try {
            $respuesta = Http::withToken($bot['token'])->timeout(15)->post("{$bot['url']}/desconectar");
            return $respuesta->json();
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
