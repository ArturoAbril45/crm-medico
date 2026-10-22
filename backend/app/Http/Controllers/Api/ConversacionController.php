<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversacion;
use App\Services\IaBotService;
use Illuminate\Http\Request;

class ConversacionController extends Controller {
    public function index(Request $request) {
        $query = Conversacion::with('paciente')->orderByDesc('ultimo_mensaje_at');

        if ($request->estado) {
            $query->where('estado', $request->estado);
        }
        if ($request->buscar) {
            $q = $request->buscar;
            $query->whereHas('paciente', function ($p) use ($q) {
                $p->where('nombre', 'like', "%{$q}%")
                    ->orWhere('telefono', 'like', "%{$q}%")
                    ->orWhere('whatsapp', 'like', "%{$q}%");
            });
        }

        return $query->get();
    }

    public function show(Conversacion $conversacion) {
        $conversacion->load('paciente', 'flujoActivo', 'agente:id,name');

        $opcionesMenu = null;
        if ($conversacion->esperando_respuesta && $conversacion->flujo_activo_id && $conversacion->nodo_actual_client_id) {
            $nodo = \App\Models\Bloque::where('flujo_id', $conversacion->flujo_activo_id)
                ->where('client_id', $conversacion->nodo_actual_client_id)
                ->first();
            if ($nodo && $nodo->tipo === 'menu') {
                $opcionesMenu = collect($nodo->config['opciones'] ?? [])->pluck('texto')->filter()->values();
            }
        }

        $conversacion->setAttribute('opciones_menu_activo', $opcionesMenu);
        return $conversacion;
    }

    public function tomar(Request $request, Conversacion $conversacion) {
        $conversacion->update(['estado' => 'abierta', 'agente_id' => $request->user()->id]);
        return response()->json($conversacion);
    }

    public function devolver(Conversacion $conversacion) {
        $conversacion->update(['estado' => 'pendiente', 'agente_id' => null]);
        return response()->json($conversacion);
    }

    public function toggleAutomatizacion(Conversacion $conversacion) {
        $conversacion->update(['automatizacion_activa' => !$conversacion->automatizacion_activa]);
        return response()->json($conversacion);
    }

    public function resolver(Conversacion $conversacion) {
        $conversacion->update(['estado' => 'cerrada']);
        return response()->json($conversacion);
    }

    public function enviarFlujo(Request $request, Conversacion $conversacion, \App\Services\FlowEngine $flowEngine) {
        $data = $request->validate(['flujo_id' => 'required|exists:flujos,id']);
        $flujo = \App\Models\Flujo::findOrFail($data['flujo_id']);
        $conversacion->load('paciente');

        $flowEngine->iniciarManual($conversacion->paciente, $conversacion, $flujo, \App\Support\Tenant::companiaId());

        return response()->json($conversacion->fresh());
    }

    public function sugerirIa(Conversacion $conversacion, IaBotService $iaBot) {
        $mensajes = $conversacion->mensajes()->where('tipo_contenido', 'texto')->orderByDesc('created_at')->limit(10)->get()->reverse();
        if ($mensajes->isEmpty()) {
            return response()->json(['sugerencia' => null, 'message' => 'No hay mensajes en la conversación'], 422);
        }

        $ultimoEntrante = $mensajes->last(fn ($m) => $m->tipo === 'entrante');
        if (!$ultimoEntrante) {
            return response()->json(['sugerencia' => null, 'message' => 'No hay un mensaje del cliente para responder'], 422);
        }

        $historial = $mensajes->filter(fn ($m) => $m->id !== $ultimoEntrante->id)
            ->map(fn ($m) => ['role' => $m->tipo === 'entrante' ? 'user' : 'assistant', 'content' => $m->contenido])
            ->values()->all();

        $instrucciones = 'Sos un agente humano de atención al cliente de Med-Advance, una clínica de cirugía y medicina estética. '
            . 'Respondé de forma breve, profesional, cálida y en español, continuando la conversación de WhatsApp con el paciente/contacto.';

        $sugerencia = $iaBot->generarRespuesta($instrucciones, 0.6, $historial, $ultimoEntrante->contenido);

        if (!$sugerencia) {
            return response()->json(['sugerencia' => null, 'message' => 'El asistente de IA no está configurado o no respondió'], 422);
        }

        return response()->json(['sugerencia' => $sugerencia]);
    }
}
