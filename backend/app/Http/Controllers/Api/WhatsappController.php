<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compania;
use App\Models\Conversacion;
use App\Models\Paciente;
use App\Services\FlowEngine;
use App\Services\WhatsappClient;
use App\Support\Tenant;
use Illuminate\Http\Request;

class WhatsappController extends Controller {
    public function __construct(private WhatsappClient $whatsapp) {}

    private function companiaActivaOFallo() {
        $companiaId = Tenant::companiaId();
        if (!$companiaId) {
            abort(response()->json(['message' => 'No hay una compañía activa para esta cuenta'], 422));
        }
        return $companiaId;
    }

    public function estado() {
        return response()->json($this->whatsapp->estado($this->companiaActivaOFallo()));
    }

    public function qr() {
        return response()->json(['qr' => $this->whatsapp->qr($this->companiaActivaOFallo())]);
    }

    public function desconectar() {
        $ok = $this->whatsapp->desconectar($this->companiaActivaOFallo());
        return response()->json(['message' => $ok ? 'Desconectado' : 'No se pudo desconectar'], $ok ? 200 : 500);
    }

    public function webhook(Request $request, FlowEngine $engine) {
        $token = $request->header('X-Service-Token');
        $esperado = env('WHATSAPP_SERVICE_TOKEN', '');
        if ($esperado && $token !== $esperado) {
            return response()->json(['message' => 'Token invalido'], 401);
        }

        $data = $request->validate([
            'telefono' => 'required|string',
            'texto' => 'required|string',
            'nombre' => 'nullable|string',
            'jid' => 'nullable|string',
            'tipo_contenido' => 'nullable|in:texto,imagen,audio,documento,video',
            'archivo_url' => 'nullable|string',
            'compania_id' => 'nullable|integer',
        ]);

        // El microservicio manda la compania de la sesion que recibio el mensaje. Si
        // todavia no manda nada (version vieja desplegada, o compania desconocida),
        // se cae a la unica compania existente antes de multi-sesion para no romper
        // el flujo automatico que ya estaba funcionando.
        $companiaId = $data['compania_id'] ?? null;
        if ($companiaId && !Compania::where('id', $companiaId)->exists()) {
            $companiaId = null;
        }
        if (!$companiaId) {
            $companiaId = Compania::query()->value('id');
        }

        // El webhook es una ruta publica (la llama el microservicio Node, no un
        // usuario logueado) y no pasa por ResolveCompania, asi que hay que fijar
        // el tenant a mano antes de tocar modelos aislados por compania.
        Tenant::set($companiaId);

        $paciente = Paciente::where('telefono', $data['telefono'])->orWhere('whatsapp', $data['telefono'])->first();
        if (!$paciente) {
            $nombre = trim((string) ($data['nombre'] ?? '')) ?: 'Contacto';
            $paciente = Paciente::create([
                'nombre' => $nombre,
                'apellido' => '',
                'telefono' => $data['telefono'],
                'whatsapp' => $data['telefono'],
                'whatsapp_jid' => $data['jid'] ?? null,
                'estado' => 'potencial',
                'fuente' => 'whatsapp',
            ]);
        } elseif (($data['jid'] ?? null) && $paciente->whatsapp_jid !== $data['jid']) {
            $paciente->update(['whatsapp_jid' => $data['jid']]);
        }

        $conversacion = Conversacion::firstOrCreate(
            ['paciente_id' => $paciente->id, 'canal' => 'whatsapp'],
            ['estado' => 'abierta']
        );
        if ($conversacion->estado === 'cerrada') {
            $conversacion->update(['estado' => 'pendiente']);
        }

        $engine->procesarMensajeEntrante(
            $paciente,
            $conversacion,
            $data['texto'],
            $companiaId,
            $data['tipo_contenido'] ?? 'texto',
            $data['archivo_url'] ?? null
        );

        return response()->json(['message' => 'Procesado']);
    }
}
