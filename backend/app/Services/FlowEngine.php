<?php
namespace App\Services;

use App\Models\Automatizacion;
use App\Models\Bloque;
use App\Models\BloqueEdge;
use App\Models\Cita;
use App\Models\Conversacion;
use App\Models\Flujo;
use App\Models\Mensaje;
use App\Models\Paciente;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Recorre los flujos disenados en el editor visual (ver Flujo/Bloque/BloqueEdge)
 * para un contacto real, paso a paso, manteniendo el punto exacto donde quedo
 * cada conversacion (Conversacion::nodo_actual_client_id) para poder continuar
 * cuando la persona responda.
 */
class FlowEngine {
    private const MAX_PASOS = 25; // corta ciclos infinitos dentro de un mismo mensaje entrante
    private int $companiaId;

    public function __construct(private WhatsappClient $whatsapp, private IaBotService $iaBot) {}

    public function procesarMensajeEntrante(Paciente $paciente, Conversacion $conversacion, string $texto, int $companiaId, string $tipoContenido = 'texto', ?string $archivoUrl = null): void {
        \Log::error('DEBUG entrada procesarMensajeEntrante', ['texto' => $texto, 'conv_id' => $conversacion->id]);
        $this->companiaId = $companiaId;
        $this->registrarMensaje($conversacion, 'entrante', $texto, $tipoContenido, $archivoUrl);

        if (!$conversacion->automatizacion_activa) return;

        if ($conversacion->esperando_respuesta && $conversacion->flujo_activo_id && $conversacion->nodo_actual_client_id) {
            $this->continuarDesdeMenu($paciente, $conversacion, $texto);
            return;
        }

        $automatizacion = $this->buscarAutomatizacionQueCoincide($texto);
        if (!$automatizacion || !$automatizacion->flujo_id) return;

        $flujo = Flujo::find($automatizacion->flujo_id);
        if (!$flujo) return;

        $automatizacion->increment('ejecuciones');

        $inicio = Bloque::where('flujo_id', $flujo->id)->where('tipo', 'inicio')->first();
        if (!$inicio) return;

        $conversacion->update(['flujo_activo_id' => $flujo->id]);
        $this->avanzar($paciente, $conversacion, $flujo, $inicio->client_id, null, 0);
    }

    /** Dispara un flujo manualmente sobre una conversacion, desde el panel de Bandeja (boton "Enviar flujo"). */
    public function iniciarManual(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, int $companiaId): void {
        $this->companiaId = $companiaId;

        $inicio = Bloque::where('flujo_id', $flujo->id)->where('tipo', 'inicio')->first();
        if (!$inicio) return;

        $conversacion->update(['flujo_activo_id' => $flujo->id, 'esperando_respuesta' => false, 'nodo_actual_client_id' => null]);
        $this->avanzar($paciente, $conversacion, $flujo, $inicio->client_id, null, 0);
    }

    private function continuarDesdeMenu(Paciente $paciente, Conversacion $conversacion, string $texto): void {
        $flujo = Flujo::find($conversacion->flujo_activo_id);
        $nodo = $flujo ? Bloque::where('flujo_id', $flujo->id)->where('client_id', $conversacion->nodo_actual_client_id)->first() : null;

        if (!$flujo || !$nodo) {
            $conversacion->update(['esperando_respuesta' => false, 'flujo_activo_id' => null, 'nodo_actual_client_id' => null]);
            return;
        }

        if ($nodo->tipo === 'asistente_gpt') {
            $this->continuarConversacionIa($paciente, $conversacion, $flujo, $nodo, $texto);
            return;
        }

        if ($nodo->tipo !== 'menu') {
            $conversacion->update(['esperando_respuesta' => false, 'flujo_activo_id' => null, 'nodo_actual_client_id' => null]);
            return;
        }

        if (($nodo->config['modo'] ?? 'opciones') === 'libre') {
            $this->continuarDesdePreguntaLibre($paciente, $conversacion, $flujo, $nodo, $texto);
            return;
        }

        $opciones = $nodo->config['opciones'] ?? [];
        $textoLimpio = trim($texto);
        $elegida = null;

        // 1) coincidencia por numero (el usuario responde "1", "2", etc)
        if (ctype_digit($textoLimpio)) {
            $idx = ((int) $textoLimpio) - 1;
            $elegida = $opciones[$idx] ?? null;
        }
        // 2) coincidencia por texto de la opcion
        if (!$elegida) {
            foreach ($opciones as $op) {
                if (Str::contains(Str::lower($op['texto'] ?? ''), Str::lower($textoLimpio)) ||
                    Str::contains(Str::lower($textoLimpio), Str::lower($op['texto'] ?? ''))) {
                    $elegida = $op;
                    break;
                }
            }
        }

        if (!$elegida) {
            $this->enviar($conversacion, 'No entendí tu respuesta. Por favor, elegí una de las opciones del mensaje anterior.');
            return; // se mantiene esperando en el mismo nodo
        }

        $conversacion->update(['esperando_respuesta' => false]);
        $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, 'option_' . $elegida['id'], 0);
    }

    /**
     * Nodo "menu" en modo libre: pide un dato de texto (ej. cedula) en vez de
     * ofrecer opciones fijas. Valida el formato de la respuesta; si no coincide,
     * avisa que es incorrecta y vuelve a mandar la pregunta, sin avanzar.
     */
    private function continuarDesdePreguntaLibre(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, string $texto): void {
        $textoLimpio = trim($texto);
        $validacion = $nodo->config['validacion'] ?? 'texto';

        $valido = match ($validacion) {
            'cedula', 'numero' => (bool) preg_match('/^[0-9]{5,15}$/', preg_replace('/[\s.\-]/', '', $textoLimpio)),
            default => $textoLimpio !== '',
        };

        if (!$valido) {
            $mensajeError = trim((string) ($nodo->config['mensajeError'] ?? '')) ?: 'Tu respuesta es incorrecta, intenta de nuevo.';
            $this->enviar($conversacion, $mensajeError);
            $pregunta = trim((string) ($nodo->config['pregunta'] ?? ''));
            if ($pregunta !== '') $this->enviar($conversacion, $pregunta);
            return; // se mantiene esperando en el mismo nodo
        }

        $campo = $nodo->config['campoGuardar'] ?? null;
        if ($campo && in_array($campo, $paciente->getFillable())) {
            $paciente->update([$campo => preg_replace('/[\s.\-]/', '', $textoLimpio)]);
        }

        $conversacion->update(['esperando_respuesta' => false]);
        $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, null, 0);
    }

    private function avanzar(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, string $desdeClientId, ?string $desdeHandle, int $paso): void {
        if ($paso >= self::MAX_PASOS) return;

        $edgeQuery = BloqueEdge::where('flujo_id', $flujo->id)->where('from_client_id', $desdeClientId);
        $edgeQuery = $desdeHandle === null ? $edgeQuery->whereNull('from_handle') : $edgeQuery->where('from_handle', $desdeHandle);
        $edge = $edgeQuery->first();

        if (!$edge) {
            $conversacion->update(['flujo_activo_id' => null, 'nodo_actual_client_id' => null, 'esperando_respuesta' => false]);
            return;
        }

        $nodo = Bloque::where('flujo_id', $flujo->id)->where('client_id', $edge->to_client_id)->first();
        if (!$nodo) return;

        match ($nodo->tipo) {
            'contenido' => $this->ejecutarContenido($paciente, $conversacion, $flujo, $nodo, $paso),
            'menu' => $this->ejecutarMenu($conversacion, $flujo, $nodo),
            'condicion' => $this->ejecutarCondicion($paciente, $conversacion, $flujo, $nodo, $paso),
            'accion' => $this->ejecutarAccion($paciente, $conversacion, $flujo, $nodo, $paso),
            'conexion_flujo' => $this->ejecutarConexionFlujo($paciente, $conversacion, $flujo, $nodo, $paso),
            'randomizer' => $this->ejecutarRandomizer($paciente, $conversacion, $flujo, $nodo, $paso),
            'retraso_inteligente' => $this->ejecutarRetraso($paciente, $conversacion, $flujo, $nodo, $paso),
            'integracion' => $this->ejecutarIntegracion($paciente, $conversacion, $flujo, $nodo, $paso),
            'asistente_gpt' => $this->ejecutarAsistenteGpt($paciente, $conversacion, $flujo, $nodo, $paso),
            default => $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, null, $paso + 1),
        };
    }

    private function ejecutarContenido(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, int $paso): void {
        foreach (($nodo->config['bloques'] ?? []) as $item) {
            $tipo = $item['type'] ?? 'texto';

            if ($tipo === 'retraso') {
                sleep(min((int) ($item['segundos'] ?? 0), 5)); // tope de 5s para no colgar el webhook
            } elseif (in_array($tipo, ['imagen', 'video', 'audio', 'archivo'])) {
                $url = trim((string) ($item['url'] ?? ''));
                $tipoContenido = $tipo === 'archivo' ? 'documento' : $tipo;
                if ($url !== '') $this->enviarMedia($conversacion, $tipoContenido, $url, $item['caption'] ?? null);
            } elseif ($tipo === 'autooff') {
                // Apaga la automatizacion de esta conversacion: el bot deja de responder
                // automaticamente y un agente humano toma el control desde la Bandeja.
                $conversacion->update(['automatizacion_activa' => false]);
            } elseif ($tipo === 'contacto') {
                $nombre = trim((string) ($item['nombre'] ?? ''));
                $telefono = trim((string) ($item['telefono'] ?? ''));
                $texto = trim("Contacto: {$nombre}\n{$telefono}");
                if ($texto !== '') $this->enviar($conversacion, $texto);
            } elseif ($tipo === 'guardar') {
                // Guarda la ultima respuesta que el contacto envio en el campo indicado.
                $campo = $item['campo'] ?? null;
                if ($campo && in_array($campo, $paciente->getFillable())) {
                    $ultimoEntrante = Mensaje::where('conversacion_id', $conversacion->id)
                        ->where('tipo', 'entrante')->orderByDesc('created_at')->value('contenido');
                    if ($ultimoEntrante) $paciente->update([$campo => trim($ultimoEntrante)]);
                }
            } else {
                $texto = trim((string) ($item['texto'] ?? ''));
                if ($texto !== '') $this->enviar($conversacion, $texto);
            }
        }
        $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, null, $paso + 1);
    }

    private function ejecutarMenu(Conversacion $conversacion, Flujo $flujo, Bloque $nodo): void {
        $opciones = $nodo->config['opciones'] ?? [];
        $texto = trim((string) ($nodo->config['pregunta'] ?? ''));
        if (count($opciones)) {
            $texto .= "\n\n" . collect($opciones)->values()->map(fn ($o, $i) => ($i + 1) . '. ' . ($o['texto'] ?? ''))->implode("\n");
        }

        // Texto plano SIEMPRE (garantiza que le llegue a todos los contactos, sin
        // importar que tan vieja sea su version de WhatsApp) y, ademas, se intenta
        // mandar tambien como lista tocable — los celulares con WhatsApp mas nuevo
        // van a ver esa version interactiva en vez de (o ademas de) el texto.
        if ($texto !== '') {
            $this->enviar($conversacion, $texto);
            if (count($opciones) >= 2 && count($opciones) <= 10) {
                $this->intentarEnviarComoLista($conversacion, $texto, $opciones);
            }
        }

        $conversacion->update([
            'flujo_activo_id' => $flujo->id,
            'nodo_actual_client_id' => $nodo->client_id,
            'esperando_respuesta' => true,
        ]);
    }

    /**
     * Intento EXTRA de mandar el menu como lista tocable, ademas del texto plano
     * que ya se mando (y ya quedo registrado) en ejecutarMenu. No registra un
     * segundo mensaje — es un bonus visual sobre el mismo mensaje, no uno nuevo.
     */
    private function intentarEnviarComoLista(Conversacion $conversacion, string $texto, array $opciones): bool {
        try {
            $paciente = $conversacion->paciente;
            $destino = $paciente->whatsapp_jid ?: ($paciente->whatsapp ?: $paciente->telefono);
            $filas = collect($opciones)->values()->map(fn ($o) => ['id' => (string) ($o['id'] ?? ''), 'texto' => (string) ($o['texto'] ?? '')])->all();
            return $this->whatsapp->enviarLista($this->companiaId, $destino, $texto, 'Ver opciones', $filas);
        } catch (\Throwable $e) {
            \Log::warning('FlowEngine: fallo el intento extra de menu como lista', ['error' => $e->getMessage()]);
            return false;
        }
    }

    private function ejecutarCondicion(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, int $paso): void {
        $campo = $nodo->config['campo'] ?? '';
        $operador = $nodo->config['operador'] ?? '==';
        $valor = $nodo->config['valor'] ?? '';
        $actual = (string) ($paciente->{$campo} ?? '');

        $resultado = match ($operador) {
            '!=' => Str::lower($actual) !== Str::lower($valor),
            'contiene' => Str::contains(Str::lower($actual), Str::lower($valor)),
            default => Str::lower($actual) === Str::lower($valor),
        };

        $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, $resultado ? 'true' : 'false', $paso + 1);
    }

    private function ejecutarAccion(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, int $paso): void {
        $tipo = $nodo->config['tipoAccion'] ?? '';
        $valor = $nodo->config['valor'] ?? '';

        if (Str::contains($tipo, 'Etiqueta') && in_array($valor, ['activo', 'inactivo', 'potencial'])) {
            $paciente->update(['estado' => $valor]);
        } elseif ($tipo === 'Cerrar conversación') {
            $conversacion->update(['estado' => 'cerrada']);
        } elseif ($tipo === 'Configurar/Actualizar el valor de un campo' && Str::contains($valor, '=')) {
            [$campo, $val] = array_map('trim', explode('=', $valor, 2));
            if (in_array($campo, $paciente->getFillable())) $paciente->update([$campo => $val]);
        } elseif ($tipo === 'Reservar cita') {
            // El bot agenda solo, sin intervencion de un admin: crea la cita ya
            // confirmada con los datos que junto durante la conversacion.
            $motivo = trim((string) ($nodo->config['motivo'] ?? 'Consulta'));
            $dias = max((int) ($nodo->config['diasDesdeHoy'] ?? 1), 0);
            $hora = trim((string) ($nodo->config['hora'] ?? '10:00'));
            $fechaHora = now()->addDays($dias)->setTimeFromTimeString($hora);
            Cita::create([
                'paciente_id' => $paciente->id,
                'fecha_hora' => $fechaHora,
                'duracion_min' => 30,
                'estado' => 'confirmada',
                'motivo' => $motivo,
            ]);
        }
        // el resto de tipos de accion (secuencias, notificaciones al equipo) todavia no tienen backend propio; se ignoran sin cortar el flujo.

        $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, null, $paso + 1);
    }

    private function ejecutarConexionFlujo(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, int $paso): void {
        $nombre = $nodo->config['nombreFlujo'] ?? '';
        $otroFlujo = Flujo::where('nombre', $nombre)->first();
        if (!$otroFlujo) return;

        $inicio = Bloque::where('flujo_id', $otroFlujo->id)->where('tipo', 'inicio')->first();
        if (!$inicio) return;

        $conversacion->update(['flujo_activo_id' => $otroFlujo->id]);
        $this->avanzar($paciente, $conversacion, $otroFlujo, $inicio->client_id, null, $paso + 1);
    }

    private function ejecutarRandomizer(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, int $paso): void {
        $ramas = $nodo->config['ramas'] ?? [];
        if (!count($ramas)) return;

        $total = array_sum(array_column($ramas, 'porcentaje')) ?: 1;
        $rand = mt_rand(1, (int) $total);
        $acumulado = 0;
        $elegida = $ramas[0];
        foreach ($ramas as $r) {
            $acumulado += ($r['porcentaje'] ?? 0);
            if ($rand <= $acumulado) { $elegida = $r; break; }
        }

        $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, 'rama_' . $elegida['id'], $paso + 1);
    }

    private function ejecutarRetraso(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, int $paso): void {
        if (($nodo->config['modo'] ?? 'retraso') === 'retraso') {
            $cantidad = (int) ($nodo->config['cantidad'] ?? 0);
            $unidad = $nodo->config['unidad'] ?? 'minutos';
            // solo se espera de verdad si el retraso es breve (segundos/pocos minutos); retrasos largos
            // (horas/dias) requieren un scheduler propio que todavia no existe, se continua sin esperar.
            if ($unidad === 'minutos' && $cantidad <= 1) sleep($cantidad * 60 > 5 ? 5 : $cantidad * 60);
        }
        $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, null, $paso + 1);
    }

    private function ejecutarIntegracion(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, int $paso): void {
        $url = $nodo->config['url'] ?? '';
        if ($url) {
            Http::timeout(5)->post($url, [
                'paciente' => $paciente->only(['id', 'nombre', 'apellido', 'telefono']),
                'evento' => 'flujo_integracion',
            ])->onError(fn () => null);
        }
        $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, null, $paso + 1);
    }

    private function ejecutarAsistenteGpt(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, int $paso): void {
        if (($nodo->config['mensajeInicialDestino'] ?? 'contacto') === 'contacto') {
            $texto = trim((string) ($nodo->config['mensajeInicialTexto'] ?? ''));
            if ($texto !== '') $this->enviar($conversacion, $texto);
        }

        // Si hay un proveedor de IA configurado y activo (Herramientas > WhatsApp AI Bot),
        // el nodo queda conversando libremente con el contacto usando sus instrucciones/temperatura
        // hasta que el flujo lo saque de aca (por ahora, permanece a la espera indefinidamente).
        if ($this->iaBotActiva()) {
            $conversacion->update([
                'flujo_activo_id' => $flujo->id,
                'nodo_actual_client_id' => $nodo->client_id,
                'esperando_respuesta' => true,
            ]);
            return;
        }

        $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, null, $paso + 1);
    }

    private function iaBotActiva(): bool {
        return (bool) \App\Models\ConfiguracionIaBot::query()->where('activo', true)->whereNotNull('api_key')->exists();
    }

    private function continuarConversacionIa(Paciente $paciente, Conversacion $conversacion, Flujo $flujo, Bloque $nodo, string $texto): void {
        $instrucciones = trim((string) ($nodo->config['instrucciones'] ?? ''));
        $conocimiento = trim((string) ($nodo->config['conocimiento'] ?? ''));
        if ($conocimiento !== '') $instrucciones = trim($instrucciones . "\n\nInformacion de referencia sobre la empresa:\n" . $conocimiento);
        $criterioExito = trim((string) ($nodo->config['criterioExito'] ?? ''));
        if ($criterioExito !== '') {
            $instrucciones = trim($instrucciones . "\n\nCuando se cumpla esta condicion: \"{$criterioExito}\", termina tu respuesta agregando en una linea aparte exactamente esta marca: [FIN_ASISTENTE]");
        }
        $temperatura = (float) ($nodo->config['temperatura'] ?? 1);

        // Espera unos segundos por si el contacto manda varios mensajes seguidos, para
        // responderlos juntos en vez de uno por uno. Si otro mensaje de la misma tanda
        // ya esta esperando el resultado, este simplemente se suma y no dispara una llamada extra.
        if ($nodo->config['agruparMensajes'] ?? false) {
            $ctx = $conversacion->contexto ?? [];
            $yaAgrupando = $ctx['agrupando_hasta'] ?? null;
            if ($yaAgrupando && now()->lt(\Carbon\Carbon::parse($yaAgrupando))) {
                return;
            }
            $segundos = min((int) ($nodo->config['tiempoEsperaSegundos'] ?? 5), 8);
            $inicioVentana = now()->subSecond();
            $conversacion->update(['contexto' => array_merge($ctx, ['agrupando_hasta' => now()->addSeconds($segundos)->toIso8601String()])]);
            sleep($segundos);
            $texto = Mensaje::where('conversacion_id', $conversacion->id)
                ->where('tipo', 'entrante')->where('created_at', '>=', $inicioVentana)
                ->orderBy('created_at')->pluck('contenido')->implode("\n");
            $conversacion->update(['contexto' => array_merge($conversacion->contexto ?? [], ['agrupando_hasta' => null])]);
        }

        $historial = Mensaje::where('conversacion_id', $conversacion->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->reverse()
            ->map(fn ($m) => ['role' => $m->tipo === 'entrante' ? 'user' : 'assistant', 'content' => $m->contenido])
            ->values()
            ->all();
        // el ultimo mensaje del historial es el que acaba de registrar procesarMensajeEntrante para este mismo texto
        array_pop($historial);

        $respuesta = $this->iaBot->generarRespuesta($instrucciones, $temperatura, $historial, $texto);

        if (!$respuesta) {
            $this->enviar($conversacion, 'Disculpá, no pude procesar tu mensaje en este momento. Un miembro del equipo te va a responder a la brevedad.');
            return;
        }

        $terminado = str_contains($respuesta, '[FIN_ASISTENTE]');
        $respuesta = trim(str_replace('[FIN_ASISTENTE]', '', $respuesta));
        if ($respuesta !== '') $this->enviar($conversacion, $respuesta);

        if ($terminado) {
            // El criterio de exito se cumplio: sale de la conversacion libre con la IA y sigue el flujo.
            $conversacion->update(['esperando_respuesta' => false]);
            $this->avanzar($paciente, $conversacion, $flujo, $nodo->client_id, null, 0);
        }
        // si no termino, se mantiene esperando en el mismo nodo para seguir la conversacion libremente
    }

    private function buscarAutomatizacionQueCoincide(string $texto): ?Automatizacion {
        $texto = Str::lower(trim($texto));
        // "cualquiera" (cualquier mensaje) va al final: es un catch-all y no debe
        // tapar a una palabra clave mas especifica que tambien matchee el texto.
        $automatizaciones = Automatizacion::where('tipo', 'palabra_clave')->where('activo', true)
            ->orderByRaw("condicion = 'cualquiera'")
            ->get();
\Log::error('DEBUG buscarAutomatizacionQueCoincide', ['texto' => $texto, 'candidatas' => $automatizaciones->map(fn($x) => ['id'=>$x->id,'condicion'=>$x->condicion,'flujo_id'=>$x->flujo_id,'palabra'=>$x->palabra_clave])->all()]);

        foreach ($automatizaciones as $a) {
            if (!$a->flujo_id) continue; // trigger incompleto (sin flujo asignado): no debe tapar a uno que si sirve
            if ($a->condicion === 'cualquiera') return $a;
            $palabra = Str::lower(trim((string) $a->palabra_clave));
            if ($palabra === '') continue;
            $coincide = match ($a->condicion) {
                'empieza_con' => Str::startsWith($texto, $palabra),
                'contiene' => Str::contains($texto, $palabra),
                default => $texto === $palabra,
            };
            if ($coincide) return $a;
        }
        return null;
    }

    private function enviar(Conversacion $conversacion, string $texto): void {
        $paciente = $conversacion->paciente;
        $destino = $paciente->whatsapp_jid ?: ($paciente->whatsapp ?: $paciente->telefono);
        $this->whatsapp->enviarMensaje($this->companiaId, $destino, $texto);
        $this->registrarMensaje($conversacion, 'saliente', $texto);
    }

    private function enviarMedia(Conversacion $conversacion, string $tipo, string $url, ?string $caption): void {
        $paciente = $conversacion->paciente;
        $destino = $paciente->whatsapp_jid ?: ($paciente->whatsapp ?: $paciente->telefono);
        $this->whatsapp->enviarMedia($this->companiaId, $destino, $tipo, $url, $caption, null);
        $this->registrarMensaje($conversacion, 'saliente', $caption ?? '', $tipo, $url);
    }

    private function registrarMensaje(Conversacion $conversacion, string $tipo, string $texto, string $tipoContenido = 'texto', ?string $archivoUrl = null): void {
        Mensaje::create([
            'conversacion_id' => $conversacion->id,
            'tipo' => $tipo,
            'contenido' => $texto,
            'tipo_contenido' => $tipoContenido,
            'archivo_url' => $archivoUrl,
            'leido' => $tipo === 'saliente',
        ]);
        $conversacion->update([
            'ultimo_mensaje' => Str::limit($texto, 250),
            'ultimo_mensaje_at' => now(),
            'mensajes_no_leidos' => $tipo === 'entrante' ? $conversacion->mensajes_no_leidos + 1 : $conversacion->mensajes_no_leidos,
        ]);
    }
}
