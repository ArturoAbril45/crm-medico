<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversacion;
use App\Models\Mensaje;
use App\Services\WhatsappClient;
use App\Support\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MensajeController extends Controller {
    public function __construct(private WhatsappClient $whatsapp) {}

    public function index(Conversacion $conversacion) {
        $mensajes = $conversacion->mensajes()->orderBy('created_at')->get();

        $conversacion->mensajes()->where('tipo', 'entrante')->where('leido', false)->update(['leido' => true]);
        if ($conversacion->mensajes_no_leidos > 0) {
            $conversacion->update(['mensajes_no_leidos' => 0]);
        }

        return $mensajes;
    }

    public function store(Request $request, Conversacion $conversacion) {
        $data = $request->validate([
            'contenido' => 'nullable|string',
            'archivo' => 'nullable|file|max:16384',
            'tipo_contenido' => 'nullable|in:texto,imagen,audio,documento',
        ]);

        $paciente = $conversacion->paciente;
        $destino = $paciente->whatsapp_jid ?: ($paciente->whatsapp ?: $paciente->telefono);
        $companiaId = Tenant::companiaId();
        if (!$companiaId) {
            return response()->json(['message' => 'No hay una compañía activa para esta cuenta'], 422);
        }

        $tipoContenido = $data['tipo_contenido'] ?? 'texto';
        $archivoUrl = null;
        $contenido = trim((string) ($data['contenido'] ?? ''));

        if ($request->hasFile('archivo')) {
            $file = $request->file('archivo');
            $ruta = $file->store("conversaciones/{$conversacion->id}", 'public');
            $archivoUrl = Storage::disk('public')->url($ruta);

            $enviado = $this->whatsapp->enviarMedia($companiaId, $destino, $tipoContenido, $archivoUrl, $contenido ?: null, $file->getClientMimeType());
            if (!$contenido) $contenido = $file->getClientOriginalName();
        } else {
            if ($contenido === '') {
                return response()->json(['message' => 'El mensaje no puede estar vacío'], 422);
            }
            $enviado = $this->whatsapp->enviarMensaje($companiaId, $destino, $contenido);
        }

        $mensaje = Mensaje::create([
            'conversacion_id' => $conversacion->id,
            'tipo' => 'saliente',
            'contenido' => $contenido,
            'tipo_contenido' => $tipoContenido,
            'archivo_url' => $archivoUrl,
            'leido' => true,
        ]);

        $conversacion->update([
            'ultimo_mensaje' => $tipoContenido === 'texto' ? $contenido : ('[' . ucfirst($tipoContenido) . ']'),
            'ultimo_mensaje_at' => now(),
        ]);

        return response()->json(['mensaje' => $mensaje, 'enviado' => $enviado], 201);
    }
}
